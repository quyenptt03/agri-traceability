const createUserToken = (user: any) => {
  return {
    userId: user._id,
    role: user.role,
  };
};

export default createUserToken;
