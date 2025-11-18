import { useState, useEffect } from "react";

interface Country {
  name: {
    common: string;
  };
}

// Cache countries to avoid multiple API calls
let countriesCache: string[] | null = null;
let countriesCachePromise: Promise<string[]> | null = null;

export function useCountries() {
  const [countries, setCountries] = useState<string[]>(["Select country"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Return cached data if available
    if (countriesCache) {
      setCountries(["Select country", ...countriesCache]);
      setLoading(false);
      return;
    }

    // If a fetch is already in progress, wait for it
    if (countriesCachePromise) {
      countriesCachePromise
        .then((data) => {
          setCountries(["Select country", ...data]);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
      return;
    }

    // Fetch countries from REST Countries API
    countriesCachePromise = fetch("https://restcountries.com/v3.1/all?fields=name")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch countries");
        }
        return res.json();
      })
      .then((data: Country[]) => {
        // Sort countries alphabetically by common name
        const sortedCountries = data
          .map((country) => country.name.common)
          .sort((a, b) => a.localeCompare(b));
        
        countriesCache = sortedCountries;
        return sortedCountries;
      })
      .catch((err) => {
        console.error("Error fetching countries:", err);
        // Fallback to common countries if API fails
        countriesCache = [
          "Nigeria",
          "Kenya",
          "Ghana",
          "Tanzania",
          "Uganda",
          "Ethiopia",
          "South Africa",
          "Zambia",
          "Malawi",
          "Mozambique",
        ];
        return countriesCache;
      })
      .finally(() => {
        countriesCachePromise = null;
      });

    countriesCachePromise
      .then((data) => {
        setCountries(["Select country", ...data]);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { countries, loading, error };
}

