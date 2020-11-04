import moment from 'moment';

const KILOBYTE = 1024;
const MEGABYTE = KILOBYTE * 1024;

export default class ChatMessage {
  constructor(rawMessage={}) {
    this.nickname = rawMessage.nick;
    this.displayName = rawMessage.display_name;
    this.timestamp = moment(rawMessage.timestamp);
    this.text = rawMessage.msg;
    this.options = rawMessage.options;
    this.attachment = rawMessage.attachment;
    this.structuredMessage = rawMessage.structured_msg;
    this.isRatingRequest = !!rawMessage.isRatingRequest;
  }

  get isVisitor() { return this.nickname === 'visitor'; }
  get isAgent() { return /agent:/.test(this.nickname); }
  get isStatus() { return !this.nickname; }

  /** Files **/
  get hasFile() { return !!this.attachment; }
  get fileUrl() { return this.attachment && this.attachment.url; }
  get fileName() { return this.attachment && this.attachment.name; }
  get isImage() { return this.attachment && /^image\/.*/.test(this.attachment.mime_type); }
  get fileSize() {
    if(!this.attachment) { return null; }
    if(this.attachment.size > MEGABYTE) { return `${(this.attachment.size / MEGABYTE).toFixed(1)}MB`; }
    if(this.attachment.size > KILOBYTE) { return `${(this.attachment.size / KILOBYTE).toFixed(1)}KB`; }
    return `${this.attachment.size}bytes`;
  }
}
