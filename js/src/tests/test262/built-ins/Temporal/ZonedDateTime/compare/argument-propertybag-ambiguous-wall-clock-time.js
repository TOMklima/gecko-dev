// |reftest| skip-if(!this.hasOwnProperty('Temporal')) -- Temporal is not enabled unconditionally
// Copyright (C) 2023 Igalia, S.L. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-temporal.zoneddatetime.compare
description: >
  Correct time zone calls are made when converting a ZonedDateTime-like property
  bag denoting an ambiguous wall-clock time
includes: [temporalHelpers.js, compareArray.js]
features: [Temporal]
---*/

const actual = [];

const dstTimeZone = TemporalHelpers.springForwardFallBackTimeZone();
const timeZone1 = TemporalHelpers.timeZoneObserver(actual, "one.timeZone", {
  getOffsetNanosecondsFor: dstTimeZone.getOffsetNanosecondsFor.bind(dstTimeZone),
  getPossibleInstantsFor: dstTimeZone.getPossibleInstantsFor.bind(dstTimeZone),
});
const timeZone2 = TemporalHelpers.timeZoneObserver(actual, "two.timeZone", {
  getOffsetNanosecondsFor: dstTimeZone.getOffsetNanosecondsFor.bind(dstTimeZone),
  getPossibleInstantsFor: dstTimeZone.getPossibleInstantsFor.bind(dstTimeZone),
});
const calendar1 = TemporalHelpers.calendarObserver(actual, "one.calendar");
const calendar2 = TemporalHelpers.calendarObserver(actual, "two.calendar");

const expectedOne = [
  // GetTemporalCalendarSlotValueWithISODefault
  "has one.calendar.dateAdd",
  "has one.calendar.dateFromFields",
  "has one.calendar.dateUntil",
  "has one.calendar.day",
  "has one.calendar.dayOfWeek",
  "has one.calendar.dayOfYear",
  "has one.calendar.daysInMonth",
  "has one.calendar.daysInWeek",
  "has one.calendar.daysInYear",
  "has one.calendar.fields",
  "has one.calendar.id",
  "has one.calendar.inLeapYear",
  "has one.calendar.mergeFields",
  "has one.calendar.month",
  "has one.calendar.monthCode",
  "has one.calendar.monthDayFromFields",
  "has one.calendar.monthsInYear",
  "has one.calendar.weekOfYear",
  "has one.calendar.year",
  "has one.calendar.yearMonthFromFields",
  "has one.calendar.yearOfWeek",
  // lookup
  "get one.calendar.dateFromFields",
  "get one.calendar.fields",
  // CalendarFields
  "call one.calendar.fields",
  // ToTemporalTimeZoneSlotValue
  "has one.timeZone.getOffsetNanosecondsFor",
  "has one.timeZone.getPossibleInstantsFor",
  "has one.timeZone.id",
  // InterpretTemporalDateTimeFields
  "call one.calendar.dateFromFields",
  // lookup
  "get one.timeZone.getPossibleInstantsFor",
  // InterpretISODateTimeOffset
  "call one.timeZone.getPossibleInstantsFor",
];

const expectedTwo = [
  // GetTemporalCalendarSlotValueWithISODefault
  "has two.calendar.dateAdd",
  "has two.calendar.dateFromFields",
  "has two.calendar.dateUntil",
  "has two.calendar.day",
  "has two.calendar.dayOfWeek",
  "has two.calendar.dayOfYear",
  "has two.calendar.daysInMonth",
  "has two.calendar.daysInWeek",
  "has two.calendar.daysInYear",
  "has two.calendar.fields",
  "has two.calendar.id",
  "has two.calendar.inLeapYear",
  "has two.calendar.mergeFields",
  "has two.calendar.month",
  "has two.calendar.monthCode",
  "has two.calendar.monthDayFromFields",
  "has two.calendar.monthsInYear",
  "has two.calendar.weekOfYear",
  "has two.calendar.year",
  "has two.calendar.yearMonthFromFields",
  "has two.calendar.yearOfWeek",
  // lookup
  "get two.calendar.dateFromFields",
  "get two.calendar.fields",
  // CalendarFields
  "call two.calendar.fields",
  // ToTemporalTimeZoneSlotValue
  "has two.timeZone.getOffsetNanosecondsFor",
  "has two.timeZone.getPossibleInstantsFor",
  "has two.timeZone.id",
  // InterpretTemporalDateTimeFields
  "call two.calendar.dateFromFields",
  // lookup
  "get two.timeZone.getPossibleInstantsFor",
  // InterpretISODateTimeOffset
  "call two.timeZone.getPossibleInstantsFor",
];

Temporal.ZonedDateTime.compare(
  { year: 2000, month: 4, day: 2, hour: 2, minute: 30, timeZone: timeZone1, calendar: calendar1 },
  { year: 2000, month: 4, day: 2, hour: 2, minute: 30, timeZone: timeZone2, calendar: calendar2 },
);

const expectedSpringForward = expectedOne.concat([
  // DisambiguatePossibleInstants
  "get one.timeZone.getOffsetNanosecondsFor",
  "call one.timeZone.getOffsetNanosecondsFor",
  "call one.timeZone.getOffsetNanosecondsFor",
  "call one.timeZone.getPossibleInstantsFor",
], expectedTwo, [
  // DisambiguatePossibleInstants
  "get two.timeZone.getOffsetNanosecondsFor",
  "call two.timeZone.getOffsetNanosecondsFor",
  "call two.timeZone.getOffsetNanosecondsFor",
  "call two.timeZone.getPossibleInstantsFor",
]);
assert.compareArray(actual, expectedSpringForward, "order of operations converting property bags at skipped wall-clock time");
actual.splice(0); // clear

Temporal.ZonedDateTime.compare(
  { year: 2000, month: 10, day: 29, hour: 1, minute: 30, timeZone: timeZone1, calendar: calendar1 },
  { year: 2000, month: 10, day: 29, hour: 1, minute: 30, timeZone: timeZone2, calendar: calendar2 },
);

const expectedFallBack = expectedOne.concat(expectedTwo);
assert.compareArray(actual, expectedFallBack, "order of operations converting property bags at repeated wall-clock time");
actual.splice(0); // clear

reportCompare(0, 0);
