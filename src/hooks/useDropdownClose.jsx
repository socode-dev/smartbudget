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
        if (secondSetter) {
          secondSetter(false);
        }
        if (thirdSetter) {
          thirdSetter(false);
        }
        if (fourthSetter) {
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
