import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  id: string;
  name: string;
  price: number;
  dailyIncome: number;
  totalIncome: number;
  validityDays: number;
}

const ProductSchema = new Schema<IProduct>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  dailyIncome: { type: Number, required: true },
  totalIncome: { type: Number, required: true },
  validityDays: { type: Number, required: true },
}, {
  timestamps: false,
});

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;

