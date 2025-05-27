"use client";

import { useEffect, useState } from "react";
import { Plus, Phone, Trash2 } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface PhoneNumber {
  id: string;
  number: string;
  createdAt: string;
  updatedAt: string;
}

export default function PhoneNumbersPage() {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const fetchPhoneNumbers = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch("/api/user/numbers", {
        headers: {
          user_id: user.id,
        },
      });
      const data = await response.json();
      if (data.phoneNumbers) {
        setPhoneNumbers(data.phoneNumbers);
      }
    } catch (error) {
      console.error("Failed to fetch phone numbers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchPhoneNumbers();
    }
  }, [authLoading, user?.id]);

  const handleDelete = async (id: string) => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/user/numbers/${id}`, {
        method: "DELETE",
        headers: {
          user_id: user.id,
        },
      });

      if (response.ok) {
        setPhoneNumbers(phoneNumbers.filter((num) => num.id !== id));
      } else {
        console.error("Failed to delete phone number");
      }
    } catch (error) {
      console.error("Failed to delete phone number");
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
            Please sign in to view your phone numbers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Phone Numbers
        </h1>
        <button onClick={() => router.push("/phone-numbers/add")} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="h-5 w-5" />
          Add Number
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : phoneNumbers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
          <div className="flex flex-col items-center justify-center h-64">
            <Phone className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No phone numbers found
            </p>
            <button
              onClick={() => router.push("/phone-numbers/add")}
              className="mt-4 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Add your first number
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {phoneNumbers.map((phone) => (
            <div
              key={phone.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {phone.number}
                </h3>
                <button
                  onClick={() => handleDelete(phone.id)}
                  className="text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                <p>Added: {new Date(phone.createdAt).toLocaleDateString()}</p>
                <p>
                  Last updated: {new Date(phone.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
