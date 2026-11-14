import { describe, expect, it } from 'vitest';
import { youtubeVideo } from './youtube-video.js';
describe('YouTube video URLs', () => {
  it('recognizes Shorts without carrying tracking parameters into the embed', () => {
    expect(youtubeVideo('https://youtube.com/shorts/I-JhZjzQMLY?si=tracking')).toEqual({ id: 'I-JhZjzQMLY', portrait: true });
  });
  it.each(['https://www.youtube.com/watch?v=I-JhZjzQMLY', 'https://youtu.be/I-JhZjzQMLY', 'https://www.youtube-nocookie.com/embed/I-JhZjzQMLY'])('recognizes supported video URL %s', value => {
    expect(youtubeVideo(value)).toEqual({ id: 'I-JhZjzQMLY', portrait: false });
  });
  it.each(['javascript:alert(1)', 'https://youtube.com.attacker.example/shorts/I-JhZjzQMLY', 'https://youtube.com@attacker.example/watch?v=I-JhZjzQMLY', 'http://youtube.com/shorts/I-JhZjzQMLY', 'https://www.youtube.com/channel/I-JhZjzQMLY', 'https://www.youtube.com/watch?v=invalid', 'https://youtu.be/I-JhZjzQMLY/extra'])('rejects unsupported or unsafe URL %s', value => {
    expect(youtubeVideo(value)).toBeUndefined();
  });
});
