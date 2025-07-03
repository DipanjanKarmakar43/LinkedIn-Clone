


const activeCheck = async (req, res) => {
  res.status(200).json({
    message: "Server is active",
    timestamp: new Date().toISOString(),
  });
};

export { activeCheck };