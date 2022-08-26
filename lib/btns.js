import {
  ACTION_ADD,
  ACTION_CLEAR,
  ACTION_DIV,
  ACTION_DOT,
  ACTION_EQ,
  ACTION_EXP,
  ACTION_MULT,
  ACTION_PARENTH_LEFT,
  ACTION_PARENTH_RIGHT,
  ACTION_PERCENT,
  ACTION_REMOVE,
  ACTION_ROOT,
  ACTION_SUBS,
  PRIORITY_ADD_SUBS,
  PRIORITY_EXP,
  PRIORITY_MULT_DIV,
  PRIORITY_PARETHESES,
  TYPE_ACTION,
  TYPE_DIGIT,
  TYPE_DOT,
  TYPE_PARENTH,
} from "./constants";

export const MathActions = [
  {
    action: ACTION_ADD,
    text: ACTION_ADD,
    type: TYPE_ACTION,
    priority: PRIORITY_ADD_SUBS,
  },
  {
    action: ACTION_SUBS,
    text: ACTION_SUBS,
    type: TYPE_ACTION,
    priority: PRIORITY_ADD_SUBS,
  },
  {
    action: ACTION_DIV,
    text: ACTION_DIV,
    type: TYPE_ACTION,
    priority: PRIORITY_MULT_DIV,
  },
  {
    action: ACTION_MULT,
    text: ACTION_MULT,
    type: TYPE_ACTION,
    priority: PRIORITY_MULT_DIV,
  },
  {
    action: ACTION_PARENTH_LEFT,
    text: ACTION_PARENTH_LEFT,
    type: TYPE_PARENTH,
    priority: PRIORITY_PARETHESES,
  },
  {
    action: ACTION_PARENTH_RIGHT,
    text: ACTION_PARENTH_RIGHT,
    type: TYPE_PARENTH,
    priority: PRIORITY_PARETHESES,
  },
  {
    action: ACTION_EXP,
    text: ACTION_EXP,
    type: TYPE_ACTION,
    priority: PRIORITY_EXP,
  },
  {
    action: ACTION_ROOT,
    text: ACTION_ROOT,
    type: TYPE_ACTION,
    priority: PRIORITY_EXP,
  },
];

export const Digits = [
  { text: "7", type: TYPE_DIGIT },
  { text: "8", type: TYPE_DIGIT },
  { text: "9", type: TYPE_DIGIT },

  { text: "4", type: TYPE_DIGIT },
  { text: "5", type: TYPE_DIGIT },
  { text: "6", type: TYPE_DIGIT },

  { text: "1", type: TYPE_DIGIT },
  { text: "2", type: TYPE_DIGIT },
  { text: "3", type: TYPE_DIGIT },

  { text: "00", type: TYPE_DIGIT },
  { text: "0", type: TYPE_DIGIT },
  { text: ACTION_DOT, type: TYPE_DOT },
];

export const Actions = [
  {
    action: ACTION_PERCENT,
    text: ACTION_PERCENT,
    type: TYPE_ACTION,
    priority: PRIORITY_EXP,
  },
  {
    text: ACTION_REMOVE,
    type: TYPE_ACTION,
  },
  {
    text: ACTION_CLEAR,
    type: TYPE_ACTION,
  },
  {
    text: ACTION_EQ,
    type: TYPE_ACTION,
  },
];
