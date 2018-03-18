export default (...args: any[]) => {
  console.info(new Date().toISOString() + ' | ', ...args);
}