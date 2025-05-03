import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Mail, Phone, MessageCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    question: "How do I hire staff through your platform?",
    answer: "To hire staff, start by browsing our 'Discover' section. You can filter staff based on your requirements, schedule interviews, and proceed with hiring after successful interviews. Our platform guides you through each step of the process.",
    category: "Hiring Process"
  },
  {
    question: "What verification checks do you perform?",
    answer: "We conduct comprehensive background checks including identity verification, reference checks, and criminal record checks. All staff are thoroughly vetted before being listed on our platform.",
    category: "Verification"
  },
  {
    question: "How are staff rates determined?",
    answer: "Staff rates are based on factors including experience level, qualifications, and type of service. You can view detailed pricing information on each staff profile.",
    category: "Pricing"
  },
  {
    question: "What happens if I'm not satisfied with the staff?",
    answer: "We offer a replacement guarantee within the first month of hiring. Contact our support team, and we'll help you find a more suitable staff member.",
    category: "Support"
  },
  {
    question: "How do I manage payments?",
    answer: "Payments are handled securely through our platform using Paystack. You can manage your subscription and view payment history in your dashboard settings.",
    category: "Payments"
  }
];

const categories = ["All", "Hiring Process", "Verification", "Pricing", "Support", "Payments"];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Help Center</h1>
      <p className="text-gray-600 mb-8">Find answers to common questions or contact our support team</p>

      {/* Search and Filter */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                selectedCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="space-y-4 mb-12">
        {filteredFAQs.map((faq) => (
          <div
            key={faq.question}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setExpandedQuestion(
                expandedQuestion === faq.question ? null : faq.question
              )}
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
            >
              <span className="font-medium text-gray-900">{faq.question}</span>
              {expandedQuestion === faq.question ? (
                <ChevronUp className="text-gray-500" size={20} />
              ) : (
                <ChevronDown className="text-gray-500" size={20} />
              )}
            </button>
            {expandedQuestion === faq.question && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact Support */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Still need help?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Email Support</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get help via email. We typically respond within 24 hours.
              </p>
              <a
                href="mailto:support@example.com"
                className="mt-2 text-sm font-medium text-primary hover:text-primary-600"
              >
                support@example.com
              </a>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Phone Support</h3>
              <p className="mt-1 text-sm text-gray-500">
                Available Monday to Friday, 9am - 5pm WAT
              </p>
              <a
                href="tel:+2348000000000"
                className="mt-2 text-sm font-medium text-primary hover:text-primary-600"
              >
                +234 800 000 0000
              </a>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Live Chat</h3>
              <p className="mt-1 text-sm text-gray-500">
                Chat with our support team in real-time
              </p>
              <button
                className="mt-2 text-sm font-medium text-primary hover:text-primary-600"
              >
                Start Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}