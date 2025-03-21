router.get('/confirm-email', async (req, res) => {
    try {
        const { token } = req.query;
        
        const userId = decoded.userId;

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(400).send('Invalid confirmation link.');
        }

        user.isEmailConfirmed = true;
        await user.save();

        res.status(200).send('Email confirmed successfully!');
    } catch (error) {
        console.error('Error confirming email:', error);
        res.status(500).send('An error occurred while confirming your email. Please try again.');
    }
});

module.exports = router;
