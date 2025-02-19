/* Any copyright is dedicated to the Public Domain.
   http://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

ChromeUtils.defineESModuleGetters(this, {
  JsonSchema: "resource://gre/modules/JsonSchema.sys.mjs",
  SearchEngineSelectorOld:
    "resource://gre/modules/SearchEngineSelectorOld.sys.mjs",
});

/**
 * Checks to see if a value is an object or not.
 *
 * @param {*} value
 *   The value to check.
 * @returns {boolean}
 */
function isObject(value) {
  return value != null && typeof value == "object" && !Array.isArray(value);
}

/**
 * This function modifies the schema to prevent allowing additional properties
 * on objects. This is used to enforce that the schema contains everything that
 * we deliver via the search configuration.
 *
 * These checks are not enabled in-product, as we want to allow older versions
 * to keep working if we add new properties for whatever reason.
 *
 * @param {object} section
 *   The section to check to see if an additionalProperties flag should be added.
 */
function disallowAdditionalProperties(section) {
  if (section.type == "object") {
    section.additionalProperties = false;
  }
  for (let value of Object.values(section)) {
    if (isObject(value)) {
      disallowAdditionalProperties(value);
    }
  }
}

let searchConfigSchema;

add_setup(async function () {
  searchConfigSchema = await IOUtils.readJSON(
    PathUtils.join(do_get_cwd().path, "search-engine-config-schema.json")
  );
});

add_task(async function test_search_config_validates_to_schema() {
  disallowAdditionalProperties(searchConfigSchema);

  let selector = new SearchEngineSelectorOld(() => {});
  let searchConfig = await selector.getEngineConfiguration();
  let validator = new JsonSchema.Validator(searchConfigSchema);

  for (let entry of searchConfig) {
    // Records in Remote Settings contain additional properties independent of
    // the schema. Hence, we don't want to validate their presence.
    delete entry.schema;
    delete entry.id;
    delete entry.last_modified;

    let result = validator.validate(entry);
    let message = `Should validate ${entry.webExtension?.id}`;
    if (!result.valid) {
      message += `:\n${JSON.stringify(result.errors, null, 2)}`;
    }
    Assert.ok(result.valid, message);
  }
});

add_task(async function test_ui_schema_valid() {
  let uiSchema = await IOUtils.readJSON(
    PathUtils.join(do_get_cwd().path, "search-engine-config-ui-schema.json")
  );

  for (let key of Object.keys(searchConfigSchema.properties)) {
    Assert.ok(
      uiSchema["ui:order"].includes(key),
      `Should have ${key} listed at the top-level of the ui schema`
    );
  }
});
