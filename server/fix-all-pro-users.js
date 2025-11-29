import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import { PLANS } from './config/esewa.js';

dotenv.config();

async function fixAllProUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users with pro subscription
    const proUsers = await User.find({ subscription: 'pro' });
    
    console.log(`\n📊 Found ${proUsers.length} Pro users\n`);

    if (proUsers.length === 0) {
      console.log('No Pro users found');
      process.exit(0);
    }

    // Get the correct credits for pro plan
    const proPlanCredits = PLANS.pro.credits;
    
    console.log('🔧 Pro Plan Credits:');
    console.log('  Resume Generations:', proPlanCredits.resumeGenerations);
    console.log('  Portfolios:', proPlanCredits.portfolios);
    console.log('  Cover Letters:', proPlanCredits.coverLetters);
    console.log('\n' + '='.repeat(60) + '\n');

    // Update each pro user
    for (const user of proUsers) {
      console.log(`👤 User: ${user.name} (${user.email})`);
      console.log('   Current Credits:');
      console.log('   - Resume:', user.credits?.resumeGenerations || 0);
      console.log('   - Portfolio:', user.credits?.portfolios || 0);
      console.log('   - Cover Letters:', user.credits?.coverLetters || 0);

      // Update user credits
      await User.findByIdAndUpdate(user._id, {
        subscription: 'pro',
        credits: proPlanCredits
      });

      console.log('   ✅ Updated to Pro plan credits\n');
    }

    console.log('='.repeat(60));
    console.log(`\n✅ Successfully updated ${proUsers.length} Pro users!`);

    // Verify the updates
    console.log('\n📊 Verification:');
    const updatedUsers = await User.find({ subscription: 'pro' });
    for (const user of updatedUsers) {
      console.log(`   ${user.name}: Resume=${user.credits.resumeGenerations}, Portfolio=${user.credits.portfolios}, CoverLetters=${user.credits.coverLetters}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixAllProUsers();
