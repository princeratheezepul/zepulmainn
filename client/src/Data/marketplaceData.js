// Sample job data for marketplace
export const jobListings = [
  {
    id: 1,
    company: 'Google',
    logo: '/assets/companies.png',
    title: 'Product Designer',
    location: 'Remote - Hyderabad',
    type: 'Full Time',
    experience: '5+ years',
    commission: '8% Commission',
    posted: 'Posted 15 May, 2025',
    status: 'Urgent',
    statusColor: 'bg-orange-500',
    description: "We're looking for a Product Designer to craft clean, user-friendly digital experiences. You'll work with product and engineering teams to design wireframes, prototypes, and UI flows. 5+ years of experience in product or UX/UI design.",
    submitted: '22 Submitted',
    timeLeft: '3d left'
  },
  {
    id: 2,
    company: 'Google',
    logo: '/assets/companies.png',
    title: 'Product Designer',
    location: 'Remote - Hyderabad',
    type: 'Full Time',
    experience: '5+ years',
    commission: '8% Commission',
    posted: 'Posted 15 May, 2025',
    status: 'New',
    statusColor: 'bg-green-500',
    description: "We're looking for a Product Designer to craft clean, user-friendly digital experiences. You'll work with product and engineering teams to design wireframes, prototypes, and UI flows. 5+ years of experience in product or UX/UI design.",
    submitted: '22 Submitted',
    timeLeft: '3d left'
  },
  {
    id: 3,
    company: 'Google',
    logo: '/assets/companies.png',
    title: 'Product Designer',
    location: 'Remote - Hyderabad',
    type: 'Full Time',
    experience: '5+ years',
    commission: '8% Commission',
    posted: 'Posted 15 May, 2025',
    status: 'Actively Recruiting',
    statusColor: 'bg-yellow-500',
    description: "We're looking for a Product Designer to craft clean, user-friendly digital experiences. You'll work with product and engineering teams to design wireframes, prototypes, and UI flows. 5+ years of experience in product or UX/UI design.",
    submitted: '22 Submitted',
    timeLeft: '3d left'
  }
];

export const yourPicks = [
  {
    id: 1,
    company: 'Google',
    title: 'Product Designer',
    location: 'Remote - Hyderabad',
    type: 'Full Time',
    submitted: '22 Submitted',
    timeAgo: '2d ago'
  },
  {
    id: 2,
    company: 'Google',
    title: 'Product Designer',
    location: 'Remote - Hyderabad',
    type: 'Full Time',
    submitted: '22 Submitted',
    timeAgo: '2d ago'
  },
  {
    id: 3,
    company: 'Google',
    title: 'Product Designer',
    location: 'Remote - Hyderabad',
    type: 'Full Time',
    submitted: '22 Submitted',
    timeAgo: '2d ago'
  },
  {
    id: 4,
    company: 'Google',
    title: 'Product Designer',
    location: 'Remote - Hyderabad',
    type: 'Full Time',
    submitted: '22 Submitted',
    timeAgo: '2d ago'
  },
  {
    id: 5,
    company: 'Google',
    title: 'Product Designer',
    location: 'Remote - Hyderabad',
    type: 'Full Time',
    submitted: '22 Submitted',
    timeAgo: '2d ago'
  }
];

export const jobsListings = [
  {
    _id: 1,
    id: 1,
    company: 'Google',
    title: 'Product Designer',
    location: 'Remote - Hyderabad',
    type: 'Full Time',
    experience: '5+ years',
    commissionPercent: 8,
    commission: '8% Commission',
    postedDate: '2025-05-15',
    posted: 'Posted 15 May, 2025',
    status: 'Active',
    statusColor: 'bg-green-500',
    description: "We're looking for a Product Designer to craft clean, user-friendly digital experiences. You'll work with product and engineering teams to design wireframes, prototypes, and UI flows. 5+ years of experience in product or UX/UI design.",
    timeLeft: '3d left',
    isBookmarked: false
  },
  {
    _id: 2,
    id: 2,
    company: 'Microsoft',
    title: 'Senior Developer',
    location: 'Remote - Bangalore',
    type: 'Full Time',
    experience: '7+ years',
    commissionPercent: 10,
    commission: '10% Commission',
    postedDate: '2025-05-14',
    posted: 'Posted 14 May, 2025',
    status: 'Urgent',
    statusColor: 'bg-red-500',
    description: "We're looking for a Senior Developer to join our team and work on cutting-edge projects. You'll be responsible for developing scalable applications and mentoring junior developers.",
    timeLeft: '2d left',
    isBookmarked: true
  },
  {
    _id: 3,
    id: 3,
    company: 'Amazon',
    title: 'UX Designer',
    location: 'Remote - Mumbai',
    type: 'Contract',
    experience: '4+ years',
    commissionPercent: 6,
    commission: '6% Commission',
    postedDate: '2025-05-13',
    posted: 'Posted 13 May, 2025',
    status: 'Completed',
    statusColor: 'bg-blue-100 text-gray-800',
    description: "We're looking for a UX Designer to create intuitive and engaging user experiences. You'll work closely with product managers and developers to deliver exceptional designs.",
    timeLeft: '1d left',
    isBookmarked: false
  }
];

// Wallet data
export const walletData = {
  totalEarnings: '₹0',
  pendingEarnings: '₹0',
  profitPercentage: '0%',
  currentDate: '08 May, 2025',
  accounts: [
    {
      id: 1,
      bankName: 'ICICI Bank',
      cardNumber: '**** 4028',
      accountNumber: 'ICIC0000001',
      holderName: 'Apoorva Bairi',
      gradient: 'from-[#E28C87] via-[#E3987B] to-[#E5EFA8]'
    },
    {
      id: 2,
      bankName: 'ICICI Bank',
      cardNumber: '**** 4028',
      accountNumber: 'ICIC0000001',
      holderName: 'Apoorva Bairi',
      gradient: 'from-blue-500 via-blue-400 to-blue-200'
    }
  ],
  transactions: [
    {
      id: 1,
      activity: 'ABC Tech Ltd.',
      date: '08-05-25',
      status: 'Received',
      statusColor: 'bg-green-500',
      amount: '₹41,216'
    },
    {
      id: 2,
      activity: 'PQR Tech Ltd.',
      date: '08-05-25',
      status: 'Deducted',
      statusColor: 'bg-red-500',
      amount: '-₹41,216'
    },
    {
      id: 3,
      activity: 'ABC Tech Ltd.',
      date: '08-05-25',
      status: 'Withdrawn',
      statusColor: 'bg-gray-500',
      amount: '-₹41,216'
    },
    {
      id: 4,
      activity: 'XYZ Corp.',
      date: '08-05-25',
      status: 'Received',
      statusColor: 'bg-green-500',
      amount: '₹25,000'
    },
    {
      id: 5,
      activity: 'DEF Solutions',
      date: '08-05-25',
      status: 'Deducted',
      statusColor: 'bg-red-500',
      amount: '-₹15,000'
    }
  ]
};
