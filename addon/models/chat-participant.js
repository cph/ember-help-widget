export default class ChatParticipant {
  constructor(rawParticipant={}) {
    this.nickname = rawParticipant.nick;
    this.displayName = rawParticipant.display_name;
    this.title = rawParticipant.title;
    this.avatarUrl = rawParticipant.avatar_path
  }
}

