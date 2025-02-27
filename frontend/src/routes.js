import { Chat } from "./components/chat/Chat.js";
import { LeaderBoard } from "./components/leaderBoard/LeaderBoard.js";
import { Profile } from "./components/profile/Profile.js";
import { ProfileViewer } from "./components/profile/ProfileViewer.js";
import { Home } from "./components/home/Home.js";
import { NotFound } from "./components/errors/NotFound.js";
import { Settings } from "./components/settings/Settings.js";

import { Game } from "./components/game/Game.js";
import { GameDisplayer } from "./components/game/GameDisplayer.js";
import { Verify2FA } from "./components/authentication/Verify2FA.js";
import { Tournament } from "./components/tournament/Tournament.js";


export const routes = [
  {
    path: "/",
    component: Tournament,
  },

  {
    path: "/chat",
    component: Chat,
  },
  {
    path: "/chat/:id",
    component: Chat,
  },
  {
    path: "/leaderbord",
    component: LeaderBoard,
  },
  {
    path: "/settings",
    component: Settings,
  },
  {
    path: "/profile",
    component: Profile,
  },
  {
    path: "/profile/:id",
    component: ProfileViewer,
  },
  {
    path:"/game",
    component: Game,
  },
  {
    path:"/game/:id",
    component: Game,
  },
  {
    path: "/tournament/:tournamentId/game/:id",
    component: Game,
  },
  {
    path:"/tournament",
    component: Tournament,
  },
  {
    path:"/tournament/:id",
    component: Tournament,
  },
  {
    path:"/verify-2fa",
    component: Verify2FA,
    skip_auth: true,
  },
  {
    path: "*",
    component: NotFound,
  },
];
