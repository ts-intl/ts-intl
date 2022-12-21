const rules = [
  'no-dynamic-keys',
  'no-forbidden-keys',
  'no-missing-keys',
  'no-namespace-hook',
  'icu-message-format',
  'no-mismatch-t',
  'icu-message-format-json',
  'no-raw-text',
  'no-missing-keys-in-other-locales',
];

module.exports = {
  rules: Object.fromEntries(rules.map((rule) => [rule, require('./' + rule)])),
};
