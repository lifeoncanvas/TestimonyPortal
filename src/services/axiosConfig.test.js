describe('axiosConfig', () => {
  it('uses the deployed backend URL when no env override is set', () => {
    const api = require('./axiosConfig').default;
    expect(api.defaults.baseURL).toBe('http://148.66.154.48:8083');
  });
});
