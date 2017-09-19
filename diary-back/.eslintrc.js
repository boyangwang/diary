module.exports = {
    extends: 'airbnb-base',
    rules: {
        'no-underscore-dangle': ['error', {allow: ['_id']}],
        'consistent-return': ['error', {treatUndefinedAsUnspecified: true}],
        'no-console': 0
    }
};