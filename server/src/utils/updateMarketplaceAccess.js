import { User } from '../models/user.model.js';

export const updateUserMarketplaceAccess = async (req, res) => {
  try {
    const { userId, accessToMPDashboard } = req.body;
    
    if (!userId || typeof accessToMPDashboard !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'User ID and accessToMPDashboard (boolean) are required'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { accessToMPDashboard },
      { new: true, select: '-password -refreshToken' }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Marketplace access ${accessToMPDashboard ? 'granted' : 'revoked'} successfully`,
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating marketplace access:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
