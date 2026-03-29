import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

interface GuideStep {
  icon: string;
  title: string;
  description: string;
  details: string[];
  color: string;
}

@Component({
  selector: 'app-guide',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './guide.html',
  styleUrls: ['./guide.css']
})
export class GuideComponent {

  activeStep: number | null = null;

  constructor(private router: Router) {}

  steps: GuideStep[] = [
    {
      icon: 'pi pi-user-plus',
      title: '1. Create Your Account',
      description: 'Sign up with your email and verify via OTP to get started.',
      details: [
        'Go to the "Join Now" button on the top-right corner.',
        'Fill in your Full Name, Username, Email, and Password.',
        'A verification code (OTP) will be sent to your email.',
        'Enter the OTP to activate your account and log in.'
      ],
      color: '#059669'
    },
    {
      icon: 'pi pi-id-card',
      title: '2. Set Up Your Profile',
      description: 'Complete your identity by adding personal details and address.',
      details: [
        'Click "Profile" in the top navigation bar.',
        'Go to "Edit Profile" to update your name, username, phone, and bio.',
        'Navigate to "Address" tab to set your province, district, municipality, ward, and street.',
        'Your address is used during order placement and delivery logistics.'
      ],
      color: '#0284c7'
    },
    {
      icon: 'pi pi-briefcase',
      title: '3. Register for a Role',
      description: 'Choose to be a Farmer, Buyer, or Delivery Linker — or all three!',
      details: [
        'In your Profile sidebar, click "Join as Farmer", "Join as Buyer", or "Join as Linker".',
        'Fill in the role-specific registration form (e.g., farm details for Farmer).',
        'An Admin will review and verify your application.',
        'Once verified, you can access your role-specific dashboard.'
      ],
      color: '#7c3aed'
    },
    {
      icon: 'pi pi-box',
      title: '4. Farmer: List Your Produce',
      description: 'As a verified Farmer, add stocks with images, pricing, and availability.',
      details: [
        'Go to your Farmer Dashboard from the Profile sidebar.',
        'Click "Create Stock" to add a new product listing.',
        'Upload product images, select category/subcategory, set price and quantity.',
        'Your stock will appear in the public marketplace for all buyers to see.'
      ],
      color: '#ea580c'
    },
    {
      icon: 'pi pi-shopping-cart',
      title: '5. Buyer: Browse & Order',
      description: 'Explore the marketplace, find fresh produce, and place orders.',
      details: [
        'Click "Stocks" in the top navigation to browse the marketplace.',
        'Use filters to narrow results by category, price, or availability.',
        'Click on a product to see full details, images, and farmer info.',
        'Click "Order Now" to place an order — select quantity and confirm.',
        'Track your order status from the Buyer Dashboard → My Orders.'
      ],
      color: '#dc2626'
    },
    {
      icon: 'pi pi-megaphone',
      title: '6. Buyer: Post a Demand',
      description: 'Cannot find what you need? Post a demand and let farmers come to you.',
      details: [
        'Click "Demands" in the navigation bar.',
        'Click "Create Demand" to post what you are looking for.',
        'Specify the crop/product, quantity, and your preferred price range.',
        'Farmers can view and accept your demand, then create stock to fulfill it.'
      ],
      color: '#0891b2'
    },
    {
      icon: 'pi pi-truck',
      title: '7. Linker: Deliver Orders',
      description: 'As a verified Delivery Linker, pick up available delivery jobs.',
      details: [
        'Go to your Linker Dashboard from the Profile sidebar.',
        'Browse "Available Jobs" to see orders that need a delivery partner.',
        'Accept a job — you will see the farmer and buyer addresses.',
        'Pick up the order from the farmer, update checkpoints along the way.',
        'Mark as "Picked Up" and then "Delivered" to complete the delivery.'
      ],
      color: '#b45309'
    },
    {
      icon: 'pi pi-map',
      title: '8. Track Your Order',
      description: 'Real-time order tracking for Buyers, Farmers, and Linkers.',
      details: [
        'Buyers: Go to My Orders → click "Track" to see delivery progress on a live map.',
        'Farmers: View order status and see when a Linker picks up your product.',
        'Linkers: Update delivery checkpoints so all parties can see real-time progress.',
        'The map shows the route from the farmer to the buyer with live status updates.'
      ],
      color: '#4338ca'
    },
    {
      icon: 'pi pi-shield',
      title: '9. Account Security',
      description: 'Keep your account safe with password management.',
      details: [
        'Go to Profile → Security tab.',
        'Enter your current password and set a new one.',
        'Password must be 8+ characters with uppercase, lowercase, number, and special character.',
        'Your data is encrypted and your location is only shared during active deliveries.'
      ],
      color: '#be185d'
    }
  ];

  toggleStep(index: number) {
    this.activeStep = this.activeStep === index ? null : index;
  }

  goHome() {
    this.router.navigate(['/']);
  }

  goToStocks() {
    this.router.navigate(['/stocks']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}
