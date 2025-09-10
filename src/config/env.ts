const getConfig = () => {
  // runtime-env.js에서 설정된 값 또는 기본값 사용
  const runtimeConfig = window.__runtime_config__;
  
  return {
    apiGroup: runtimeConfig?.API_GROUP || '/api/v1',
    hosts: {
      user: runtimeConfig?.USER_HOST || 'http://localhost:8081',
      bill: runtimeConfig?.BILL_HOST || 'http://localhost:8081',
      product: runtimeConfig?.PRODUCT_HOST || 'http://localhost:8081',
      kosMock: runtimeConfig?.KOS_MOCK_HOST || 'http://localhost:8081',
    }
  };
};

export const config = getConfig();