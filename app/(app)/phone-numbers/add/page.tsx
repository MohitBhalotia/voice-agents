"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { Globe, Phone, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface PhoneNumber {
  friendlyName: string;
  phoneNumber: string;
  region: string;
  locality: string;
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
  };
}

const countries = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "IN", name: "India" },
];

export default function AddPhoneNumberPage() {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [localNumbers, setLocalNumbers] = useState<PhoneNumber[]>([]);
  const [tollFreeNumbers, setTollFreeNumbers] = useState<PhoneNumber[]>([]);
  const { user, loading: authLoading } = useAuth();

  const fetchNumbers = async (countryCode: string) => {
    if (!user?.id) return;
    setLocalNumbers([]);
    setTollFreeNumbers([]);
    setLoading(true);
    try {
      const response = await fetch(`/api/twilio/phoneNumbers/${countryCode}`, {
        headers: {
          user_id: user.id,
        },
      });
      const data = await response.json();
      setLocalNumbers(data.availablePhoneNumberLocal || []);
      setTollFreeNumbers(data.availablePhoneNumberTollFree || []);
    } catch (error) {
      console.error("Failed to fetch phone numbers");
    } finally {
      setLoading(false);
    }
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value;
    setSelectedCountry(countryCode);
    if (countryCode) {
      fetchNumbers(countryCode);
    }
  };

  const handleBuyNumber = async (phoneNumber: string) => {
    if (!user?.id) return;

    try {
      const response = await fetch("/api/user/numbers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          user_id: user.id,
        },
        body: JSON.stringify({ number: phoneNumber }),
      });

      if (response.ok) {
        // Handle successful purchase
        toast.success("Number purchased successfully");
        router.push("/phone-numbers");
      }
    } catch (error) {
      toast.error("Failed to purchase number");
      console.error("Failed to purchase number");
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Please sign in to add phone numbers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Add Phone Number
          </h1>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={selectedCountry}
              onChange={handleCountryChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a country</option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : selectedCountry ? (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Local Numbers */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Local Numbers
              </h2>
              <div className="space-y-4">
                {localNumbers.map((number) => (
                  <div
                    key={number.phoneNumber}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {number.friendlyName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {number.phoneNumber}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {number.locality ? number.locality : selectedCountry},{" "}
                          {number.region ? number.region : selectedCountry}
                        </p>
                      </div>
                      <button
                        onClick={() => handleBuyNumber(number.phoneNumber)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        Buy Number
                      </button>
                    </div>
                  </div>
                ))}
                {localNumbers.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No local numbers available
                  </p>
                )}
              </div>
            </div>

            {/* Toll-Free Numbers */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Toll-Free Numbers
              </h2>
              <div className="space-y-4">
                {tollFreeNumbers.map((number) => (
                  <div
                    key={number.phoneNumber}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {number.friendlyName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {number.phoneNumber}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {number.locality ? number.locality : selectedCountry},{" "}
                          {number.region ? number.region : selectedCountry}
                        </p>
                      </div>
                      <button
                        onClick={() => handleBuyNumber(number.phoneNumber)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        Buy Number
                      </button>
                    </div>
                  </div>
                ))}
                {tollFreeNumbers.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No toll-free numbers available
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
            <div className="flex flex-col items-center justify-center h-64">
              <Phone className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Select a country to view available numbers
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
