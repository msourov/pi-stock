import { useEffect, useState } from "react";

interface Branch {
  uid: string;
  name: string;
}

interface Company {
  uid: string;
  name: string;
  branches: Branch[];
}

interface OptionType {
  value: string;
  label: string;
}

export const useCompanyBranchOptions = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyOptions, setCompanyOptions] = useState<OptionType[]>([]);
  const [branchOptions, setBranchOptions] = useState<OptionType[]>([]);
  const [cbLoading, setCBLoading] = useState(false);
  const [cbError, setCBError] = useState<unknown | null>(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCompanies = async () => {
      setCBLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/company/company-helper-pam`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();
        const companyData: Company[] = data?.data || [];

        setCompanies(companyData);
        setCompanyOptions(
          companyData.map((c) => ({
            value: c.uid,
            label: c.name,
          }))
        );
      } catch (error) {
        setCBError(error);
        console.error(error);
      } finally {
        setCBLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const getBranchesByCompany = (companyId: string) => {
    const selected = companies.find((c) => c.uid === companyId);
    if (!selected) return [];

    const options = selected.branches.map((b) => ({
      value: b.uid,
      label: b.name,
    }));

    setBranchOptions(options);
    return options;
  };

  return {
    companyOptions,
    branchOptions,
    getBranchesByCompany,
    cbLoading,
    cbError,
  };
};
