export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type UserStackParamList = {
  Home: undefined;
  HouseDetail: { listingId: string };
  AgentProfile: { agentId: string };
  ChatList: undefined;
  Chat: { conversationId: string; agentId?: string };
  Favorites: undefined;
  Profile: undefined;
};

export type AgentStackParamList = {
  Dashboard: undefined;
  AddListing: undefined;
  EditListing: { listingId: string };
  ManageListings: undefined;
  ChatList: undefined;
  Chat: { conversationId: string };
  Profile: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  UserApp: undefined;
  AgentApp: undefined;
};
