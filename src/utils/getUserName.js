export const getUserName = (user) => {
  const userFirstName = user?.profile?.firstName;
  const userLastName = user?.profile?.lastName;
  const userInitials = userFirstName?.slice(0, 1) + userLastName?.slice(0, 1);

  return {
    userFirstName,
    userLastName,
    userInitials,
  };
};
