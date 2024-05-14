const searchUser = async (userModel, userEmail, userRole) => {
  const foundUser = await userModel.findOne({
    email: userEmail,
    role: { $in: [userRole] },
  });

  return foundUser;
};

module.exports = { searchUser };
