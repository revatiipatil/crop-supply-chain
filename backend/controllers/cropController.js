const Crop = require('../models/Crop');
const User = require('../models/User');
const { mintTokens } = require('../utils/solana');

// Calculate tokens based on crop weight
const calculateTokens = (weight) => {
  // Base rate: 1 token per kg
  return Math.floor(weight);
};

// @desc    Register a new crop
// @route   POST /api/crops
// @access  Private
exports.registerCrop = async (req, res) => {
  try {
    const { name, weight, location } = req.body;

    // Create crop
    const crop = await Crop.create({
      name,
      weight,
      location,
      farmer: req.user.id
    });

    // Calculate tokens to mint
    const tokensToMint = calculateTokens(weight);

    // Get user with wallet info
    const user = await User.findById(req.user.id).select('+wallet.privateKey');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Mint tokens
    const mintResult = await mintTokens(
      user.wallet.publicKey,
      Array.from(user.wallet.privateKey),
      tokensToMint
    );

    if (!mintResult.success) {
      console.error('Token minting failed:', mintResult.error);
      // Still save the crop but return warning
      return res.status(201).json({
        success: true,
        crop,
        warning: 'Crop registered but token minting failed'
      });
    }

    // Update user's token balance
    user.tokenBalance += tokensToMint;
    await user.save();

    res.status(201).json({
      success: true,
      crop,
      tokensMinted: tokensToMint,
      newBalance: user.tokenBalance
    });
  } catch (error) {
    console.error('Crop registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during crop registration'
    });
  }
};

// @desc    Get all crops for a farmer
// @route   GET /api/crops
// @access  Private
exports.getMyCrops = async (req, res) => {
  try {
    const crops = await Crop.find({ farmer: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: crops.length,
      crops
    });
  } catch (error) {
    console.error('Get crops error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching crops'
    });
  }
};

// @desc    Get single crop
// @route   GET /api/crops/:id
// @access  Private
exports.getCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({
        success: false,
        error: 'Crop not found'
      });
    }

    // Make sure user owns crop
    if (crop.farmer.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this crop'
      });
    }

    res.json({
      success: true,
      crop
    });
  } catch (error) {
    console.error('Get crop error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching crop'
    });
  }
}; 