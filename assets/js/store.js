/**
 * Cache & state SPA — giảm gọi API trùng lặp
 */
const AppStore = {
  cache: new Map(),
  DEFAULT_TTL: 300000,

  _key(action, data) {
    return action + ':' + JSON.stringify(data || {});
  },

  get(action, data) {
    const entry = this.cache.get(this._key(action, data));
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.cache.delete(this._key(action, data));
      return null;
    }
    return entry.data;
  },

  set(action, data, value, ttl) {
    this.cache.set(this._key(action, data), {
      data: value,
      expires: Date.now() + (ttl || this.DEFAULT_TTL)
    });
  },

  invalidate(prefix) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix + ':') || key === prefix) {
        this.cache.delete(key);
      }
    }
  },

  invalidateMany(actions) {
    actions.forEach(a => this.invalidate(a));
  },

  clear() {
    this.cache.clear();
  }
};

const CACHE_INVALIDATION = {
  login: ['getHomeData', 'getMembers', 'getDashboard', 'getPendingMembers', 'getAnnouncements', 'getActivities'],
  logout: [],
  register: ['getPendingMembers', 'getDashboard'],
  addMember: ['getHomeData', 'getMembers', 'getDashboard', 'getMember'],
  updateMember: ['getHomeData', 'getMembers', 'getMember', 'getDashboard'],
  deleteMember: ['getHomeData', 'getMembers', 'getDashboard', 'getPendingMembers', 'getMember'],
  approveMember: ['getHomeData', 'getMembers', 'getPendingMembers', 'getDashboard'],
  lockMember: ['getHomeData', 'getMembers', 'getMember'],
  resetPassword: [],
  addActivity: ['getHomeData', 'getActivities', 'getActivity', 'getDashboard'],
  updateActivity: ['getHomeData', 'getActivities', 'getActivity'],
  deleteActivity: ['getHomeData', 'getActivities', 'getActivity', 'getDashboard'],
  joinActivity: ['getHomeData', 'getActivities', 'getActivity'],
  addAnnouncement: ['getHomeData', 'getAnnouncements'],
  updateAnnouncement: ['getHomeData', 'getAnnouncements'],
  deleteAnnouncement: ['getHomeData', 'getAnnouncements'],
  togglePinAnnouncement: ['getHomeData', 'getAnnouncements'],
  addScore: ['getScores', 'getMember'],
  checkIn: ['getActivities', 'getActivity'],
  memberCheckIn: ['getActivities', 'getActivity'],
  setActivityQrVisible: ['getActivities', 'getActivity'],
  uploadAttendanceProof: [],
  updateProfile: ['getMember'],
  changePassword: [],
  uploadAvatar: ['getMember', 'getMembers'],
  uploadClubLogo: ['getSettings']
};
