import type { JSX, MouseEventHandler } from "react";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { IoIosLogOut } from "react-icons/io";
import { GoSearch } from "react-icons/go";
import { toast } from "react-hot-toast";
import { useAuth } from "~/stores/useAuth";
import i18n from "~/utils/i18n";

const getClassName = (isActive: boolean): string =>
  `px-4 py-4 font-title ${isActive
    ? "text-lightOrange dark:text-pop"
    : "text-darkBlue dark:text-lightOrange"
  }`;

export function NavBar(): JSX.Element {
  const [language, setLanguage] = useState("en");
  const navigate = useNavigate();
  const user = useAuth((state) => state.user);
  const logout = useAuth((state) => state.logout);
  const [open, setOpen] = useState(false);

  // Load language from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("language") || "en";
      setLanguage(savedLang);
      i18n.changeLanguage(savedLang);
    }
  }, []);

  // Handle language change
  const handleLanguageChange = async (lang: string) => {
    setLanguage(lang);
    await i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const logoutHandler: MouseEventHandler<HTMLButtonElement> = async () => {
    try {
      await logout();
      alert("You've successfully signed out");
      navigate("/");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div className="flex flex-row items-center mt-8 space-x-4">
      {user && (
        <button className="hover:text-lightOrange" onClick={logoutHandler}>
          <IoIosLogOut size={48} />
        </button>
      )}

      <select
        value={language}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="p-1 border border-black font-body rounded-md bg-white dark:bg-gray-800 text-black dark:text-white"
      >
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fi">Suomi</option>
      </select>
    </div>
  );
}
