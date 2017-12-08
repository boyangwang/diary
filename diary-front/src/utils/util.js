export default {
    getTodayString: () => (new Date()).toISOString().substring(0, 10),
};