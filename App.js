import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import {
  ACTION_ADD,
  ACTION_DIV,
  ACTION_EXP,
  ACTION_MULT,
  ACTION_PARENTH_LEFT,
  ACTION_PARENTH_RIGHT,
  ACTION_PERCENT,
  ACTION_ROOT,
  ACTION_SUBS,
  PRIORITY_EXP,
  PRIORITY_PARETHESES,
  TYPE_ACTION,
  TYPE_DIGIT,
  TYPE_DOT,
  TYPE_NUMBER,
  TYPE_PARENTH,
} from "lib/constants";
import { RandomId } from "lib/functions";
import { Actions, Digits, MathActions } from "lib/btns";
import Btn from "components/btn";
import DisplayItem from "components/display-item";

Array.prototype.findLastIndex = function (f) {
  for (let i = this.length - 1; i >= 0; i--) {
    if (f(this[i], i, this)) return i;
  }
  return -1;
};

const displayStyles = StyleSheet.create({
  display: {
    display: "flex",
    flex: 1,
    width: "100%",
    backgroundColor: "#efefef",
  },
  history: {
    padding: 20,
    flex: 1,
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  history_text: {
    fontSize: 25,
    color: "black",
  },
  result: {
    padding: 20,
    fontSize: 40,
    color: "black",
    textAlign: "right",
  },
});

const btnStyles = StyleSheet.create({
  btns: {
    flex: 1,
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
  btn: {
    width: "25%",
  },

  actions: {
    display: "flex",
    flexDirection: "row",
    alignContent: "stretch",
    flexWrap: "wrap",
    flex: 2,
    height: "100%",
  },
  digits: {
    display: "flex",
    flexDirection: "row",
    alignContent: "stretch",
    flexWrap: "wrap",
    flex: 4,
    height: "100%",
  },
});

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    backgroundColor: "#fff",
  },
});

let globalHistory = []; // save all entered(filtered) actions, numbers

const castDigits2Number = () => {
  const res = [];
  let currentDigits = ""; // storage, arr of digits(string)

  // cast
  globalHistory.forEach((v) => {
    if (v.action === ACTION_PARENTH_LEFT) return res.push(v);
    if (v.type === TYPE_ACTION || v.action === ACTION_PARENTH_RIGHT) {
      currentDigits.length > 0 &&
        res.push({ type: TYPE_NUMBER, value: parseFloat(currentDigits) });
      res.push(v);
      return (currentDigits = "");
    }
    currentDigits += v.value;
  });
  currentDigits.length > 0 &&
    res.push({ type: TYPE_NUMBER, value: parseFloat(currentDigits) });

  globalHistory = res;
};

// cuz in JS .1+.2 = .30000000004
const trimResult = (x, y) => {
  const r = x + y;
  const [ceil, dr] = String(r).split(".");
  const dx = parseInt(String(x).split(".")[1]);
  const dy = parseInt(String(y).split(".")[1]);

  if (!!dr && !!dx && !!dy && dx + dy !== parseFloat(dr)) {
    return parseFloat(`${ceil}.${dx + dy}`);
  }
  return r;
};

const calcPair = (action, x, y) => {
  if (action === ACTION_ADD) return trimResult(x, y);
  if (action === ACTION_SUBS) return x - y;
  if (action === ACTION_MULT) return x * y;
  if (action === ACTION_DIV) return x / y;
  if (action === ACTION_EXP) return Math.pow(x, y);
  if (action === ACTION_ROOT) return Math.pow(y, 1 / x);
  if (action === ACTION_PERCENT) return (x * y) / 100;
  return 0;
};

const calc = (arr) => {
  // if arr not args
  if (!arr) arr = globalHistory;

  let currPriority = PRIORITY_EXP;
  let currRes = 0;
  let haveParentheseses = arr.findIndex((v) => v.type === TYPE_PARENTH) >= 0;

  let i; // index of action by priority
  let l; // left side of slice of expression
  let r; // right side of slice of expression
  while (arr.length > 1) {
    if (currPriority === PRIORITY_PARETHESES && haveParentheseses) {
      l = arr.findIndex((v) => v.action === ACTION_PARENTH_LEFT);
      r = arr.findLastIndex((v) => v.action === ACTION_PARENTH_RIGHT);

      currRes = calc(arr.slice(l + 1, r));
      currPriority -= 1;
    } else {
      i = arr.findIndex((v) => v.priority === currPriority);

      // decreasy priority
      if (i <= 0) {
        currPriority -= 1;
        continue;
      }

      l = i - 1;
      r = i + 1;
      currRes = calcPair(
        arr[i].action,
        parseFloat(arr[i - 1].value),
        parseFloat(arr[i + 1].value)
      );
    }

    // priority is under possible
    if (currPriority === 0) break;

    arr.splice(l, r - l + 1, { value: currRes, type: TYPE_NUMBER });
  }

  return currRes;
};

const checkParentheseses = () => {
  const checker = [];

  for (const v of globalHistory) {
    if (v.action === ACTION_PARENTH_LEFT) {
      checker.push(1);
      continue;
    }

    if (v.action === ACTION_PARENTH_RIGHT) {
      if (!checker.pop()) return true;
      continue;
    }
  }

  return checker.length > 0;
};

const checkFirstlyActionOr00 = (type, value) => {
  if (globalHistory.length === 0 && (type === TYPE_ACTION || value === "00")) {
    return true;
  }
  return false;
};

const checkMultipleZero = (value, lastActionIndex) => {
  if (!value.includes("0")) return false;

  const fst = globalHistory[lastActionIndex + 1];
  const snd = globalHistory[lastActionIndex + 2];

  // if you enter 0 as 3rd number
  if (snd && snd.value.includes("0") && fst.value.includes("0")) {
    return true;
  }

  // if you enter 0 as 2nd number
  if (!snd && fst && fst.value.includes("0")) {
    return true;
  }

  return false;
};

const checkMultipleDot = (type, lastActionIndex) => {
  if (type !== TYPE_DOT) return false;

  if (
    globalHistory
      .slice(Math.max(lastActionIndex, 0))
      .find((v) => v.type === TYPE_DOT)
  ) {
    return true;
  }
  return false;
};

const checkInsertingMultipleRowDot = (type, last) => {
  return type === TYPE_DOT && type === last.type;
};

const checkInsertingAction = (action, type, last) => {
  if (type !== TYPE_ACTION) return false;

  // if enter action type multiple -> ignore
  if (action === last.action) return true;

  // if enter action type mulptile times, but actions different -> pop last action and set new later
  if (last.type === type && last.action !== action) {
    globalHistory.pop();
    return false;
  }

  // if last action is not digit nor closing parentheses
  if (last.type !== TYPE_DIGIT && last.action !== ACTION_PARENTH_RIGHT) {
    return true;
  }
};

const checkInsertingParetheses = (action, type, last) => {
  if (type !== TYPE_PARENTH) return false;

  // do not open parentheses after digit or closing parentheses
  if (
    action === ACTION_PARENTH_LEFT &&
    (last.type === TYPE_DIGIT || last.action === ACTION_PARENTH_RIGHT)
  ) {
    return true;
  }

  // do not close parentheses after action
  if (last.type === TYPE_ACTION && action === ACTION_PARENTH_RIGHT) return true;

  // if closing parentheses, there should be some action
  if (action === ACTION_PARENTH_RIGHT) {
    const i = globalHistory.findLastIndex(
      (v) => v.action === ACTION_PARENTH_LEFT
    );
    return (
      globalHistory.slice(i).findIndex((v) => v.type === TYPE_ACTION) === -1
    );
  }

  return false;
};

export default function App() {
  const [history, setHistory] = useState(null);
  const [result, setResult] = useState(0);
  const [prepared, setPrepared] = useState(false);
  const [activeElem, setActiveElem] = useState(null);

  // const [mathBtns, setMathBtns] = useState(MathActions);
  // const [activeElem, setActiveElem] = useState(null);

  const bottomBtns = useMemo(() => {
    let res = [...Digits];
    Actions.forEach((v, i) => {
      const ind = 3 * (i + 1) + i;
      res = [...res.slice(0, ind), v, ...res.slice(ind)];
    });
    return res;
  }, []);

  const addHistoryAction = useCallback((action, value, type, priority) => {
    // firstly action or twice 0
    if (checkFirstlyActionOr00(type, value)) return;

    const lastActionIndex = globalHistory.findLastIndex(
      (v) => v.type === TYPE_ACTION
    );

    // if do not insert multiple 0 before number
    if (checkMultipleZero(value, lastActionIndex)) return;

    // if have already dot in number
    if (checkMultipleDot(type, lastActionIndex)) return;

    const last = globalHistory[globalHistory.length - 1];
    if (!!last) {
      // if enter dot multiple -> ignore
      if (checkInsertingMultipleRowDot(type, last)) return;

      // check inserting +, -, *, / and other actions
      if (checkInsertingAction(action, type, last)) return;

      // chech inserting () symbols
      if (checkInsertingParetheses(action, type, last)) return;
    }

    globalHistory.push({ action, value, type, priority, id: RandomId() });
    setHistory([...globalHistory]);
  }, []);

  const calculate = () => {
    if (globalHistory.length === 0) return;

    // if parentheseses stay wrong
    if (checkParentheseses()) return clear();

    isStop = false;

    castDigits2Number();

    calc();

    const r = parseFloat(globalHistory[0].value);
    setResult(r);

    if (r !== 0) {
      globalHistory = [{ value: r, type: TYPE_NUMBER }];
      setHistory([...globalHistory]);
    }

    // FIXME: thinking how to stop when catch infinity loop
    // setTimeout(() => {
    //   isStop = true;
    // }, 500);
  };

  const clear = () => {
    setResult(0);

    globalHistory = [];
    setHistory(null);
  };

  const remove = () => {
    globalHistory.pop();
    setHistory([...globalHistory]);
  };

  // adding actions btns
  useEffect(() => {
    if (prepared) return;

    for (let i = 0; i < MathActions.length; i++) {
      const v = MathActions[i];
      MathActions[i].f = () => {
        addHistoryAction(v.action, v.text, v.type, v.priority);
      };
    }

    for (let i = 0; i < Digits.length; i++) {
      const v = Digits[i];
      Digits[i].f = () => {
        addHistoryAction("", v.text, v.type, "");
      };
    }

    const v = Actions[0];
    Actions[0].f = () => {
      addHistoryAction(v.action, v.text, v.type, v.priority);
    };
    Actions[1].f = remove;
    Actions[2].f = clear;
    Actions[3].f = calculate;

    setPrepared(true);
  }, []);

  // disable btns when active by type
  useEffect(() => {
    setPrepared(false);

    MathActions.forEach((_, i) => {
      MathActions[i].disabled = false;
    });
    Actions.forEach((_, i) => {
      Actions[i].disabled = false;
    });
    Digits.forEach((_, i) => {
      Digits[i].disabled = false;
    });

    if (activeElem?.type === TYPE_DIGIT || activeElem?.type === TYPE_NUMBER) {
      MathActions.forEach((_, i) => {
        MathActions[i].disabled = true;
      });
      Actions.forEach((_, i) => {
        Actions[i].disabled = true;
      });
    } else if (activeElem?.type === TYPE_ACTION) {
      Digits.forEach((_, i) => {
        Digits[i].disabled = true;
      });
    }

    setTimeout(() => {
      setPrepared(true);
    }, 10);
  }, [activeElem]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />

        <View style={displayStyles.display}>
          <View style={displayStyles.history}>
            {history?.map((h) => (
              <DisplayItem
                style={displayStyles.history_text}
                key={RandomId()}
                activeElem={activeElem}
                setActiveElem={setActiveElem}
                {...h}
              />
            ))}
          </View>

          <Text style={displayStyles.result}>{result}</Text>
        </View>

        <View style={btnStyles.btns}>
          <View style={btnStyles.actions}>
            {MathActions.map((a) => (
              <Btn key={a.text} {...a} style={btnStyles.btn} />
            ))}
          </View>
          <View style={btnStyles.digits}>
            {bottomBtns.map((a) => (
              <Btn {...a} key={a.text} style={[btnStyles.btn, a.style]} />
            ))}
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
