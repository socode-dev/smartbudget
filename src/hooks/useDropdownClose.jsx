import { useEffect } from "react";

export const useDropdownClose = (
  dropdownOpen,
  ref,
  setter,
  secondSetter,
  thirdSetter,
  fourthSetter
) => {
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setter(false);
        if (secondSetter || thirdSetter || fourthSetter) {
          secondSetter(false);
          thirdSetter(false);
          fourthSetter(false);
        }
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  return null;
};
