// |reftest| skip-if(!this.hasOwnProperty('Temporal')) -- Temporal is not enabled unconditionally
// Copyright (C) 2022 Igalia, S.L. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-temporal.duration.prototype.round
description: Properties on objects passed to round() are accessed in the correct order
includes: [compareArray.js, temporalHelpers.js]
features: [Temporal]
---*/

const expected = [
  "get options.largestUnit",
  "get options.largestUnit.toString",
  "call options.largestUnit.toString",
  "get options.relativeTo",
  "get options.roundingIncrement",
  "get options.roundingIncrement.valueOf",
  "call options.roundingIncrement.valueOf",
  "get options.roundingMode",
  "get options.roundingMode.toString",
  "call options.roundingMode.toString",
  "get options.smallestUnit",
  "get options.smallestUnit.toString",
  "call options.smallestUnit.toString",
];
const actual = [];

function createOptionsObserver({ smallestUnit = "nanoseconds", largestUnit = "auto", roundingMode = "halfExpand", roundingIncrement = 1, relativeTo = undefined } = {}) {
  return TemporalHelpers.propertyBagObserver(actual, {
    smallestUnit,
    largestUnit,
    roundingMode,
    roundingIncrement,
    relativeTo,
  }, "options");
}

const instance = new Temporal.Duration(0, 0, 0, 0, /* hours = */ 2400);

// basic order of operations, without relativeTo:
instance.round(createOptionsObserver({ smallestUnit: "microseconds" }));
assert.compareArray(actual, expected, "order of operations");
actual.splice(0); // clear

const expectedOpsForPlainRelativeTo = [
  "get options.largestUnit",
  "get options.largestUnit.toString",
  "call options.largestUnit.toString",
  "get options.relativeTo",
  "get options.relativeTo.calendar",
  "has options.relativeTo.calendar.dateAdd",
  "has options.relativeTo.calendar.dateFromFields",
  "has options.relativeTo.calendar.dateUntil",
  "has options.relativeTo.calendar.day",
  "has options.relativeTo.calendar.dayOfWeek",
  "has options.relativeTo.calendar.dayOfYear",
  "has options.relativeTo.calendar.daysInMonth",
  "has options.relativeTo.calendar.daysInWeek",
  "has options.relativeTo.calendar.daysInYear",
  "has options.relativeTo.calendar.fields",
  "has options.relativeTo.calendar.id",
  "has options.relativeTo.calendar.inLeapYear",
  "has options.relativeTo.calendar.mergeFields",
  "has options.relativeTo.calendar.month",
  "has options.relativeTo.calendar.monthCode",
  "has options.relativeTo.calendar.monthDayFromFields",
  "has options.relativeTo.calendar.monthsInYear",
  "has options.relativeTo.calendar.weekOfYear",
  "has options.relativeTo.calendar.year",
  "has options.relativeTo.calendar.yearMonthFromFields",
  "has options.relativeTo.calendar.yearOfWeek",
  "get options.relativeTo.calendar.dateFromFields",
  "get options.relativeTo.calendar.fields",
  "call options.relativeTo.calendar.fields",
  "get options.relativeTo.day",
  "get options.relativeTo.day.valueOf",
  "call options.relativeTo.day.valueOf",
  "get options.relativeTo.hour",
  "get options.relativeTo.microsecond",
  "get options.relativeTo.millisecond",
  "get options.relativeTo.minute",
  "get options.relativeTo.month",
  "get options.relativeTo.month.valueOf",
  "call options.relativeTo.month.valueOf",
  "get options.relativeTo.monthCode",
  "get options.relativeTo.monthCode.toString",
  "call options.relativeTo.monthCode.toString",
  "get options.relativeTo.nanosecond",
  "get options.relativeTo.offset",
  "get options.relativeTo.second",
  "get options.relativeTo.timeZone",
  "get options.relativeTo.year",
  "get options.relativeTo.year.valueOf",
  "call options.relativeTo.year.valueOf",
  "call options.relativeTo.calendar.dateFromFields",
  "get options.roundingIncrement",
  "get options.roundingIncrement.valueOf",
  "call options.roundingIncrement.valueOf",
  "get options.roundingMode",
  "get options.roundingMode.toString",
  "call options.roundingMode.toString",
  "get options.smallestUnit",
  "get options.smallestUnit.toString",
  "call options.smallestUnit.toString",
];

const plainRelativeTo = TemporalHelpers.propertyBagObserver(actual, {
  year: 2001,
  month: 5,
  monthCode: "M05",
  day: 2,
  calendar: TemporalHelpers.calendarObserver(actual, "options.relativeTo.calendar"),
}, "options.relativeTo");

// basic order of observable operations, without rounding:
instance.round(createOptionsObserver({ relativeTo: plainRelativeTo }));
assert.compareArray(actual, expectedOpsForPlainRelativeTo, "order of operations for PlainDate relativeTo");
actual.splice(0); // clear

// code path through RoundDuration that rounds to the nearest year, with minimal calendar calls:
const expectedMinimalOpsForYearRounding = expectedOpsForPlainRelativeTo.concat([
  "get options.relativeTo.calendar.dateAdd",
  "get options.relativeTo.calendar.dateUntil",
  // 7.e and 7.g not called because years, months, weeks are 0
  "call options.relativeTo.calendar.dateUntil",  // 7.o
  // 7.s not called because years, months, weeks are 0
  "call options.relativeTo.calendar.dateAdd",    // 7.y MoveRelativeDate
]);
instance.round(createOptionsObserver({ smallestUnit: "years", relativeTo: plainRelativeTo }));
assert.compareArray(actual, expectedMinimalOpsForYearRounding, "order of operations with years = 0 and smallestUnit = years");
actual.splice(0); // clear

// code path through RoundDuration that rounds to the nearest year:
const expectedOpsForYearRounding = expectedOpsForPlainRelativeTo.concat([
  "get options.relativeTo.calendar.dateAdd",
  "get options.relativeTo.calendar.dateUntil",
  "call options.relativeTo.calendar.dateAdd",    // 7.e
  "call options.relativeTo.calendar.dateAdd",    // 7.g
  "call options.relativeTo.calendar.dateUntil",  // 7.o
  "call options.relativeTo.calendar.dateAdd",    // 7.s MoveRelativeDate
  "call options.relativeTo.calendar.dateAdd",    // 7.y MoveRelativeDate
  // BalanceDateDurationRelative
  "call options.relativeTo.calendar.dateAdd",    // 11.c MoveRelativeDate
  "call options.relativeTo.calendar.dateAdd",    // 11.g MoveRelativeDate
  "call options.relativeTo.calendar.dateAdd",    // 11.k
  "call options.relativeTo.calendar.dateUntil",  // 11.p
]);
const instanceYears = new Temporal.Duration(1, 12, 0, 0, /* hours = */ 2400);
instanceYears.round(createOptionsObserver({ smallestUnit: "years", relativeTo: plainRelativeTo }));
assert.compareArray(actual, expectedOpsForYearRounding, "order of operations with smallestUnit = years");
actual.splice(0); // clear

// code path through Duration.prototype.round that rounds to the nearest month:
const expectedOpsForMonthRounding = expectedOpsForPlainRelativeTo.concat([
  "get options.relativeTo.calendar.dateAdd",
  "get options.relativeTo.calendar.dateUntil",
  // UnbalanceDurationRelative
  "call options.relativeTo.calendar.dateAdd",    // 9.d.i
  "call options.relativeTo.calendar.dateUntil",  // 9.d.iv
  // RoundDuration
  "call options.relativeTo.calendar.dateAdd",    // 10.c
  "call options.relativeTo.calendar.dateAdd",    // 10.e
  "call options.relativeTo.calendar.dateAdd",    // 10.k MoveRelativeDate
], Array(2).fill("call options.relativeTo.calendar.dateAdd"), [ // 2× 10.n.iii MoveRelativeDate
  // BalanceDurationRelative
  "call options.relativeTo.calendar.dateAdd",
]);
const instance2 = new Temporal.Duration(1, 0, 0, 62);
instance2.round(createOptionsObserver({ largestUnit: "months", smallestUnit: "months", relativeTo: plainRelativeTo }));
assert.compareArray(actual, expectedOpsForMonthRounding, "order of operations with largestUnit = smallestUnit = months");
actual.splice(0); // clear

// code path through Duration.prototype.round that rounds to the nearest week:
const expectedOpsForWeekRounding = expectedOpsForPlainRelativeTo.concat([
  "get options.relativeTo.calendar.dateAdd",
  // UnbalanceDurationRelative
  "call options.relativeTo.calendar.dateAdd",  // 10.c.i MoveRelativeDate
  "call options.relativeTo.calendar.dateAdd",  // 10.d.i MoveRelativeDate
  // RoundDuration
  "call options.relativeTo.calendar.dateAdd",  // 11.d MoveRelativeDate
], Array(58).fill("call options.relativeTo.calendar.dateAdd"), [  // 58× 11.g.iii MoveRelativeDate (52 + 4 + 2)
  // BalanceDurationRelative
  "call options.relativeTo.calendar.dateAdd",  // 12.c
]);
const instance3 = new Temporal.Duration(1, 1, 0, 15);
instance3.round(createOptionsObserver({ largestUnit: "weeks", smallestUnit: "weeks", relativeTo: plainRelativeTo }));
assert.compareArray(actual, expectedOpsForWeekRounding, "order of operations with largestUnit = smallestUnit = weeks");
actual.splice(0);  // clear

// code path through UnbalanceDurationRelative that rounds to the nearest day:
const expectedOpsForDayRounding = expectedOpsForPlainRelativeTo.concat([
  "get options.relativeTo.calendar.dateAdd",
  "call options.relativeTo.calendar.dateAdd",  // 11.a.iii.1 MoveRelativeDate
  "call options.relativeTo.calendar.dateAdd",  // 11.a.iv.1 MoveRelativeDate
  "call options.relativeTo.calendar.dateAdd",  // 11.a.v.1 MoveRelativeDate
]);
const instance4 = new Temporal.Duration(1, 1, 1)
instance4.round(createOptionsObserver({ largestUnit: "days", smallestUnit: "days", relativeTo: plainRelativeTo }));
assert.compareArray(actual, expectedOpsForDayRounding, "order of operations with largestUnit = smallestUnit = days");
actual.splice(0);  // clear

// code path through BalanceDurationRelative balancing from days up to years:
const expectedOpsForDayToYearBalancing = expectedOpsForPlainRelativeTo.concat([
  "get options.relativeTo.calendar.dateAdd",
  "get options.relativeTo.calendar.dateUntil",
  "call options.relativeTo.calendar.dateAdd",    // 10.b MoveRelativeDate
  "call options.relativeTo.calendar.dateAdd",    // 10.e.iv MoveRelativeDate
  "call options.relativeTo.calendar.dateAdd",    // 10.f MoveRelativeDate
  "call options.relativeTo.calendar.dateAdd",    // 10.i.iv MoveRelativeDate
  "call options.relativeTo.calendar.dateAdd",    // 10.j
  "call options.relativeTo.calendar.dateUntil",  // 10.n
]);
const instance5 = new Temporal.Duration(0, 0, 0, 0, /* hours = */ 396 * 24);
instance5.round(createOptionsObserver({ largestUnit: "years", smallestUnit: "days", relativeTo: plainRelativeTo }));
assert.compareArray(actual, expectedOpsForDayToYearBalancing, "order of operations with largestUnit = years, smallestUnit = days");
actual.splice(0);  // clear

// code path through Duration.prototype.round balancing from months up to years:
const expectedOpsForMonthToYearBalancing = expectedOpsForPlainRelativeTo.concat([
  "get options.relativeTo.calendar.dateAdd",
  "get options.relativeTo.calendar.dateUntil",
  // RoundDuration
  "call options.relativeTo.calendar.dateAdd",    // 10.c
  "call options.relativeTo.calendar.dateAdd",    // 10.e
  "call options.relativeTo.calendar.dateAdd",    // 10.k MoveRelativeDate
  // BalanceDurationRelative
  "call options.relativeTo.calendar.dateAdd",    // 10.b MoveRelativeDate
  "call options.relativeTo.calendar.dateAdd",    // 10.f MoveRelativeDate
  "call options.relativeTo.calendar.dateAdd",    // 10.j
  "call options.relativeTo.calendar.dateUntil",  // 10.n
  "call options.relativeTo.calendar.dateAdd",    // 10.p.iv
  "call options.relativeTo.calendar.dateUntil",  // 10.p.vii
]);
const instance6 = new Temporal.Duration(0, 12);
instance6.round(createOptionsObserver({ largestUnit: "years", smallestUnit: "months", relativeTo: plainRelativeTo }));
assert.compareArray(actual, expectedOpsForMonthToYearBalancing, "order of operations with largestUnit = years, smallestUnit = months");
actual.splice(0); // clear

const expectedOpsForDayToMonthBalancing = expectedOpsForPlainRelativeTo.concat([
  "get options.relativeTo.calendar.dateAdd",
  // BalanceDurationRelative
  "call options.relativeTo.calendar.dateAdd",    // 11.b MoveRelativeDate
  "call options.relativeTo.calendar.dateAdd",    // 11.e.iv MoveRelativeDate
]);
const instance7 = new Temporal.Duration(0, 0, 0, 0, /* hours = */ 32 * 24);
instance7.round(createOptionsObserver({ largestUnit: "months", smallestUnit: "days", relativeTo: plainRelativeTo }));
assert.compareArray(actual, expectedOpsForDayToMonthBalancing, "order of operations with largestUnit = months, smallestUnit = days");
actual.splice(0); // clear

const expectedOpsForDayToWeekBalancing = expectedOpsForPlainRelativeTo.concat([
  "get options.relativeTo.calendar.dateAdd",
  // BalanceDurationRelative
  "call options.relativeTo.calendar.dateAdd",  // 12.c MoveRelativeDate
  "call options.relativeTo.calendar.dateAdd",  // 12.f.iv MoveRelativeDate
]);
const instance8 = new Temporal.Duration(0, 0, 0, 0, /* hours = */ 8 * 24);
instance8.round(createOptionsObserver({ largestUnit: "weeks", smallestUnit: "days", relativeTo: plainRelativeTo }));
assert.compareArray(actual, expectedOpsForDayToWeekBalancing, "order of operations with largestUnit = weeks, smallestUnit = days");
actual.splice(0); // clear

const expectedOpsForZonedRelativeTo = [
  "get options.largestUnit",
  "get options.largestUnit.toString",
  "call options.largestUnit.toString",
  "get options.relativeTo",
  "get options.relativeTo.calendar",
  "has options.relativeTo.calendar.dateAdd",
  "has options.relativeTo.calendar.dateFromFields",
  "has options.relativeTo.calendar.dateUntil",
  "has options.relativeTo.calendar.day",
  "has options.relativeTo.calendar.dayOfWeek",
  "has options.relativeTo.calendar.dayOfYear",
  "has options.relativeTo.calendar.daysInMonth",
  "has options.relativeTo.calendar.daysInWeek",
  "has options.relativeTo.calendar.daysInYear",
  "has options.relativeTo.calendar.fields",
  "has options.relativeTo.calendar.id",
  "has options.relativeTo.calendar.inLeapYear",
  "has options.relativeTo.calendar.mergeFields",
  "has options.relativeTo.calendar.month",
  "has options.relativeTo.calendar.monthCode",
  "has options.relativeTo.calendar.monthDayFromFields",
  "has options.relativeTo.calendar.monthsInYear",
  "has options.relativeTo.calendar.weekOfYear",
  "has options.relativeTo.calendar.year",
  "has options.relativeTo.calendar.yearMonthFromFields",
  "has options.relativeTo.calendar.yearOfWeek",
  "get options.relativeTo.calendar.dateFromFields",
  "get options.relativeTo.calendar.fields",
  "call options.relativeTo.calendar.fields",
  "get options.relativeTo.day",
  "get options.relativeTo.day.valueOf",
  "call options.relativeTo.day.valueOf",
  "get options.relativeTo.hour",
  "get options.relativeTo.hour.valueOf",
  "call options.relativeTo.hour.valueOf",
  "get options.relativeTo.microsecond",
  "get options.relativeTo.microsecond.valueOf",
  "call options.relativeTo.microsecond.valueOf",
  "get options.relativeTo.millisecond",
  "get options.relativeTo.millisecond.valueOf",
  "call options.relativeTo.millisecond.valueOf",
  "get options.relativeTo.minute",
  "get options.relativeTo.minute.valueOf",
  "call options.relativeTo.minute.valueOf",
  "get options.relativeTo.month",
  "get options.relativeTo.month.valueOf",
  "call options.relativeTo.month.valueOf",
  "get options.relativeTo.monthCode",
  "get options.relativeTo.monthCode.toString",
  "call options.relativeTo.monthCode.toString",
  "get options.relativeTo.nanosecond",
  "get options.relativeTo.nanosecond.valueOf",
  "call options.relativeTo.nanosecond.valueOf",
  "get options.relativeTo.offset",
  "get options.relativeTo.offset.toString",
  "call options.relativeTo.offset.toString",
  "get options.relativeTo.second",
  "get options.relativeTo.second.valueOf",
  "call options.relativeTo.second.valueOf",
  "get options.relativeTo.timeZone",
  "get options.relativeTo.year",
  "get options.relativeTo.year.valueOf",
  "call options.relativeTo.year.valueOf",
  "call options.relativeTo.calendar.dateFromFields",
  "has options.relativeTo.timeZone.getOffsetNanosecondsFor",
  "has options.relativeTo.timeZone.getPossibleInstantsFor",
  "has options.relativeTo.timeZone.id",
  "get options.relativeTo.timeZone.getOffsetNanosecondsFor",
  "get options.relativeTo.timeZone.getPossibleInstantsFor",
  // InterpretISODateTimeOffset
  "call options.relativeTo.timeZone.getPossibleInstantsFor",
  "call options.relativeTo.timeZone.getOffsetNanosecondsFor",
  "get options.roundingIncrement",
  "get options.roundingIncrement.valueOf",
  "call options.roundingIncrement.valueOf",
  "get options.roundingMode",
  "get options.roundingMode.toString",
  "call options.roundingMode.toString",
  "get options.smallestUnit",
  "get options.smallestUnit.toString",
  "call options.smallestUnit.toString",
];

const zonedRelativeTo = TemporalHelpers.propertyBagObserver(actual, {
  year: 2001,
  month: 5,
  monthCode: "M05",
  day: 2,
  hour: 6,
  minute: 54,
  second: 32,
  millisecond: 987,
  microsecond: 654,
  nanosecond: 321,
  offset: "+00:00",
  calendar: TemporalHelpers.calendarObserver(actual, "options.relativeTo.calendar"),
  timeZone: TemporalHelpers.timeZoneObserver(actual, "options.relativeTo.timeZone"),
}, "options.relativeTo");

// basic order of operations with ZonedDateTime relativeTo:
instance.round(createOptionsObserver({ relativeTo: zonedRelativeTo }));
assert.compareArray(actual, expectedOpsForZonedRelativeTo, "order of operations for ZonedDateTime relativeTo");
actual.splice(0); // clear

// code path through RoundDuration that rounds to the nearest year with minimal calendar operations:
const expectedOpsForMinimalYearRoundingZoned = expectedOpsForZonedRelativeTo.concat([
  // ToTemporalDate
  "call options.relativeTo.timeZone.getOffsetNanosecondsFor",
  // lookup
  "get options.relativeTo.calendar.dateAdd",
  "get options.relativeTo.calendar.dateUntil",
  // NanosecondsToDays
  "call options.relativeTo.timeZone.getOffsetNanosecondsFor",  // 7. GetPlainDateTimeFor
  "call options.relativeTo.timeZone.getOffsetNanosecondsFor",  // 11. GetPlainDateTimeFor
  // NanosecondsToDays → AddDaysToZonedDateTime
  "call options.relativeTo.timeZone.getPossibleInstantsFor",
  // NanosecondsToDays → AddDaysToZonedDateTime
  "call options.relativeTo.timeZone.getPossibleInstantsFor",
  // RoundDuration
  // 7.e and 7.g not called because years, months, weeks are 0
  "call options.relativeTo.calendar.dateUntil",  // 7.o
  // 7.s not called because years, months, weeks are 0
  "call options.relativeTo.calendar.dateAdd",    // 7.y MoveRelativeDate
]);
instance.round(createOptionsObserver({ smallestUnit: "years", relativeTo: zonedRelativeTo }));
assert.compareArray(
  actual,
  expectedOpsForMinimalYearRoundingZoned,
  "order of operations with years = 0, smallestUnit = years and ZonedDateTime relativeTo"
);
actual.splice(0); // clear

// code path through RoundDuration that rounds to the nearest year:
const expectedOpsForYearRoundingZoned = expectedOpsForZonedRelativeTo.concat([
  // ToTemporalDate
  "call options.relativeTo.timeZone.getOffsetNanosecondsFor",
  // lookup
  "get options.relativeTo.calendar.dateAdd",
  "get options.relativeTo.calendar.dateUntil",
  // MoveRelativeZonedDateTime → AddZonedDateTime
  "call options.relativeTo.calendar.dateAdd",
  "call options.relativeTo.timeZone.getPossibleInstantsFor",
  // NanosecondsToDays
  "call options.relativeTo.timeZone.getOffsetNanosecondsFor",  // 8. GetPlainDateTimeFor
  "call options.relativeTo.timeZone.getOffsetNanosecondsFor",  // 9. GetPlainDateTimeFor
  // NanosecondsToDays → AddDaysToZonedDateTime
  "call options.relativeTo.timeZone.getPossibleInstantsFor",
  // NanosecondsToDays → AddDaysToZonedDateTime
  "call options.relativeTo.timeZone.getPossibleInstantsFor",
  "call options.relativeTo.calendar.dateAdd",    // 7.e
  "call options.relativeTo.calendar.dateAdd",    // 7.g
  "call options.relativeTo.calendar.dateUntil",  // 7.o
  "call options.relativeTo.calendar.dateAdd",    // 7.s MoveRelativeDate
  "call options.relativeTo.calendar.dateAdd",    // 7.y MoveRelativeDate
  // BalanceDateDurationRelative
  "call options.relativeTo.calendar.dateAdd",    // 11.c MoveRelativeDate
  "call options.relativeTo.calendar.dateAdd",    // 11.g MoveRelativeDate
  "call options.relativeTo.calendar.dateAdd",    // 11.k
  "call options.relativeTo.calendar.dateUntil",  // 11.p
]);
instanceYears.round(createOptionsObserver({ smallestUnit: "years", relativeTo: zonedRelativeTo }));
assert.compareArray(
  actual,
  expectedOpsForYearRoundingZoned,
  "order of operations with smallestUnit = years and ZonedDateTime relativeTo"
);
actual.splice(0); // clear

// code path that hits UnbalanceDateDurationRelative, RoundDuration, and
// BalanceDateDurationRelative
const expectedOpsForUnbalanceRoundBalance = expectedOpsForZonedRelativeTo.concat([
  // ToTemporalDate
  "call options.relativeTo.timeZone.getOffsetNanosecondsFor",
  // lookup
  "get options.relativeTo.calendar.dateAdd",
  // No user code calls in UnbalanceDurationRelative
  // RoundDuration → MoveRelativeZonedDateTime → AddZonedDateTime
  "call options.relativeTo.calendar.dateAdd",
  "call options.relativeTo.timeZone.getPossibleInstantsFor",   // 13. GetInstantFor
  // RoundDuration
  "call options.relativeTo.calendar.dateAdd",  // 8.g MoveRelativeDate
  // BalanceDateDurationRelative
  "call options.relativeTo.calendar.dateAdd",  // 13.c MoveRelativeDate
]);
new Temporal.Duration(0, 1, 1).round(createOptionsObserver({ largestUnit: "months", smallestUnit: "weeks", relativeTo: zonedRelativeTo }));
assert.compareArray(
  actual,
  expectedOpsForUnbalanceRoundBalance,
  "order of operations with largestUnit = months, smallestUnit = weeks, and ZonedDateTime relativeTo"
);
actual.splice(0); // clear

reportCompare(0, 0);
