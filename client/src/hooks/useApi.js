import { useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async ({
    url,
    method = 'GET',
    data = null,
    headers = {},
    successMessage,
    errorMessage = 'Something went wrong',
    onSuccess = () => {},
    onError = () => {},
  }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios({
        url,
        method,
        data,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      });

      if (successMessage) {
        toast.success(successMessage);
      }

      onSuccess(response.data);
      return { data: response.data, error: null };
    } catch (err) {
      const message = err.response?.data?.message || errorMessage;
      setError(message);
      toast.error(message);
      onError(err);
      return { data: null, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((url, options = {}) => {
    return request({ ...options, url, method: 'GET' });
  }, [request]);

  const post = useCallback((url, data, options = {}) => {
    return request({ ...options, url, method: 'POST', data });
  }, [request]);

  const put = useCallback((url, data, options = {}) => {
    return request({ ...options, url, method: 'PUT', data });
  }, [request]);

  const del = useCallback((url, options = {}) => {
    return request({ ...options, url, method: 'DELETE' });
  }, [request]);

  const patch = useCallback((url, data, options = {}) => {
    return request({ ...options, url, method: 'PATCH', data });
  }, [request]);

  return {
    loading,
    error,
    request,
    get,
    post,
    put,
    del,
    patch,
  };
};

export default useApi;
