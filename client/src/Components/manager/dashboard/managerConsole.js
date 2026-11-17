/**
 * Manager console navigation: which sections a manager gets, shared by the
 * dashboard and every other manager page that shows the top navigation.
 */

// Sections the top navigation can open. Mirrored in the URL as ?tab= so a refresh, or
// returning from a job detail page, lands on the section the manager left.
export const MANAGER_NAV = [
  { name: 'Overview', fullBleed: true },
  { name: 'Jobs', fullBleed: true },
  { name: 'Marketplace', fullBleed: true },
  { name: 'Recruitment Partners' },
  { name: 'License Partners' },
  { name: 'Candidates' },
  // `label` is what the bar shows; `name` stays the section key (and ?tab= value).
  { name: 'Recruiters', label: 'Team', fullBleed: true },
  { name: 'Team', label: 'Assign Jobs', fullBleed: true },
  // Opened from the avatar in the top bar, not a tab of its own.
  { name: 'Profile', fullBleed: true, hidden: true },
];

// The marketplace is run by specific managers rather than every manager on the
// platform, so the section is only offered to them. This hides it — it is not
// access control, which belongs on the marketplace endpoints themselves.
const MARKETPLACE_MANAGER_EMAILS = ['reenasumera@zepul.com'];

const canSeeMarketplace = (email) =>
  MARKETPLACE_MANAGER_EMAILS.includes(String(email || '').trim().toLowerCase());

// The partner roster belongs to the same marketplace remit as the Marketplace
// section, so the two are offered together.
const MARKETPLACE_SECTIONS = ['Marketplace', 'Recruitment Partners'];

// Only these managers create License Partners. Like the marketplace list this
// only hides the section; the License Partner endpoints enforce it.
const LICENSE_PARTNER_ADMIN_EMAILS = ['reenasumera@zepul.com'];

const canManageLicensePartners = (email) =>
  LICENSE_PARTNER_ADMIN_EMAILS.includes(String(email || '').trim().toLowerCase());

// A boolean flag on the signed-in manager, from whichever store the login path wrote.
const accountFlag = (flag) => {
  try {
    const info = JSON.parse(localStorage.getItem('userInfo'));
    if (typeof info?.data?.user?.[flag] === 'boolean') return info.data.user[flag];
    return Boolean(JSON.parse(localStorage.getItem('authUser'))?.[flag]);
  } catch {
    return false;
  }
};

export const isEmployerManagerAccount = () => accountFlag('isEmployerManager');

// A License Partner works only its own jobs and recruiters, so it gets the
// manager dashboard without the marketplace or Zepul's finances.
export const isLicensePartnerAccount = () => accountFlag('isLicensePartner');

export const managerNavFor = (email, employerManager = false, licensePartner = false) => {
  const hidden = [];
  if (employerManager || licensePartner || !canSeeMarketplace(email)) hidden.push(...MARKETPLACE_SECTIONS);
  if (licensePartner || !canManageLicensePartners(email)) hidden.push('License Partners');
  return MANAGER_NAV.filter((n) => !hidden.includes(n.name));
};

// The signed-in manager's email, from whichever store the login path wrote.
export const signedInEmail = () => {
  try {
    const info = JSON.parse(localStorage.getItem('userInfo'));
    if (info?.data?.user?.email) return info.data.user.email;
    return JSON.parse(localStorage.getItem('authUser'))?.email || '';
  } catch {
    return '';
  }
};

/**
 * Everything the console's top navigation needs about the signed-in manager:
 * the sections they get, where their pages live, and how to label them.
 */
export const managerConsole = () => {
  const employerManager = isEmployerManagerAccount();
  const licensePartner = isLicensePartnerAccount();
  const roleLabel = licensePartner ? 'License Partner' : employerManager ? 'Employer Manager' : 'Zepul Manager';
  let name = '';
  try {
    const user = JSON.parse(localStorage.getItem('userInfo'))?.data?.user;
    name = user?.fullname || user?.username || '';
  } catch { /* storage blocked */ }
  return {
    navItems: managerNavFor(signedInEmail(), employerManager, licensePartner),
    consoleBase: employerManager ? '/employermanager' : '/manager',
    roleLabel,
    managerName: name || roleLabel,
    employerManager,
    licensePartner,
  };
};
