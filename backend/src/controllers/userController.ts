import { Request, Response } from 'express';
import User from '../models/User';

export const createOrGetUser = async (req: Request, res: Response) => {
  try {
    const { clerkId, email, username } = req.body;
    
    let user = await User.findOne({ clerkId });
    
    if (!user) {
      user = new User({ clerkId, email, username });
      await user.save();
      console.log('New user created:', user.email);
    }
    
    res.json(user);
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};