import React, { useState, useEffect } from 'react';
import { Users, Plus, X, User } from 'lucide-react';

const LicensePartnersSection = ({ jobId, licensePartners = [], onUpdate }) => {
  const [partners, setPartners] = useState(licensePartners);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPartnerEmail, setNewPartnerEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPartners(licensePartners);
  }, [licensePartners]);

  const handleAddPartner = async () => {
    if (!newPartnerEmail.trim()) return;

    setLoading(true);
    try {
      // Here you would typically make an API call to add a partner
      // For now, we'll simulate it
      const newPartner = {
        id: Date.now().toString(),
        email: newPartnerEmail,
        name: newPartnerEmail.split('@')[0],
        addedAt: new Date().toISOString()
      };

      const updatedPartners = [...partners, newPartner];
      setPartners(updatedPartners);
      onUpdate(updatedPartners);
      setNewPartnerEmail('');
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding partner:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePartner = async (partnerId) => {
    setLoading(true);
    try {
      // Here you would typically make an API call to remove a partner
      const updatedPartners = partners.filter(partner => partner.id !== partnerId);
      setPartners(updatedPartners);
      onUpdate(updatedPartners);
    } catch (error) {
      console.error('Error removing partner:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(word => word.charAt(0).toUpperCase()).join('').slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-teal-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5" />
          License Partners
        </h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Partner
        </button>
      </div>

      {/* Add Partner Form */}
      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex gap-2">
            <input
              type="email"
              value={newPartnerEmail}
              onChange={(e) => setNewPartnerEmail(e.target.value)}
              placeholder="Enter partner email"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleAddPartner}
              disabled={loading || !newPartnerEmail.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewPartnerEmail('');
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Partners List */}
      <div className="space-y-2">
        {partners.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No license partners added yet</p>
            <p className="text-sm">Add partners to collaborate on this job</p>
          </div>
        ) : (
          partners.map((partner) => (
            <div
              key={partner.id}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${getAvatarColor(partner.name)} flex items-center justify-center`}>
                  <span className="text-white font-medium text-sm">
                    {getInitials(partner.name)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{partner.name}</p>
                  <p className="text-sm text-gray-500">{partner.email}</p>
                </div>
              </div>
              <button
                onClick={() => handleRemovePartner(partner.id)}
                disabled={loading}
                className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LicensePartnersSection;
