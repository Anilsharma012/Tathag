import { createContext, useState, useEffect } from "react";

export const UserContext = createContext(null);

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const updateUser = (updatedFields) => {
    const newUser = { ...(user || {}), ...updatedFields };
    setUser(newUser);
    try {
      localStorage.setItem("user", JSON.stringify(newUser));
    } catch {}
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
