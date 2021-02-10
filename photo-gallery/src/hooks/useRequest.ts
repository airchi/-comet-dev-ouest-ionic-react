import axios from 'axios';
import { useState, useEffect } from 'react';

axios.defaults.headers['x-api-key'] = '7c4b5631-f063-40b8-acda-88dbee04a247';

export const useCats = (): { isLoading: boolean; cats: any } => {
  const [cats, setCats] = useState<any>(null);
  const [isLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const request = async () => {
      try {
        setLoading(true);
        const { data } = await axios('https://api.thecatapi.com/v1/breeds');
        setCats(data);
        setLoading(false);
      } catch (error) {
        alert(error);
      }
    };
    request();
  }, []);

  return { isLoading, cats };
};
