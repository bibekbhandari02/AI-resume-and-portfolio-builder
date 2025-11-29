import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import { PLANS } from './config/esewa.js';

dotenv.config();

async function fixUserCredits() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find user with pro subscription
    const userId = '692aabbe1384f734baaaf3a9'; // From your transaction ID
    
    const user = await User.findById(userId);
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('\n📊 Current User Data:');
    console.log('Subscription:', user.subscription);
    console.log('Credits:', user.credits);
    console.log('Payment History:', user.paymentHistory?.length || 0, 'payments');

    // Get the correct credits for pro plan
    const proPlanCredits = PLANS.pro.credits;
    
    console.log('\n🔧 Fixing credits to Pro plan values:');
    console.log('Resume Generations:', proPlanCredits.resumeGenerations);
    console.log('Portfolios:', proPlanCredits.portfolios);
    console.log('Cover Letters:', proPlanCredits.coverLetters);

    // Update user credits
    await User.findByIdAndUpdate(userId, {
      subscription: 'pro',
      credits: proPlanCredits
    });

    console.log('\n✅ Credits fixed successfully!');

    // Verify the update
    const updatedUser = await User.findById(userId);
    console.log('\n📊 Updated User Data:');
    console.log('Subscription:', updatedUser.subscription);
    console.log('Credits:', updatedUser.credits);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixUserCredits();
