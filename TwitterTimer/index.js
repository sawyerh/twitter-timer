const Twitter = require("twitter");
const moment = require("moment");
const tweetsToSaveForever = require("./tweetsToSaveForever");
let log;

/**
 * Configure Twitter client
 */
const client = new Twitter({
  consumer_key: process.env["CONSUMER_KEY"],
  consumer_secret: process.env["CONSUMER_SECRET"],
  access_token_key: process.env["ACCESS_TOKEN_KEY"],
  access_token_secret: process.env["ACCESS_TOKEN_SECRET"]
});
const username = process.env["TWITTER_USERNAME"];
const maxCount = 200;
// anything older than this is deleted
const oldestAllowedDate = moment().subtract(14, "days");
const tweetMomentDateFormat = "ddd MMM DD kk:mm:ss Z YYYY";

/**
 * Azure function handler
 */
module.exports = async function(context) {
  log = context.log;
  log(
    `Deleting tweets and likes that occurred before ${oldestAllowedDate.format()}, and disabling all tweets.`
  );

  try {
    await deleteTweets();
    await deleteLikes();
    await disableRetweets();
  } catch (error) {
    log.error(error);
  }
};

/**
 * Get all of {username}'s tweets and retweets
 * @param {Number|String} maxId - Returns results with an ID less than (that is, older than) or equal to the specified ID.
 * @returns {Promise<Object[]>}
 */
async function getAllTweets(maxId) {
  const params = { count: maxCount, screen_name: username, trim_user: true };
  if (maxId) params.max_id = maxId;
  let tweets = await client.get("statuses/user_timeline", params);

  if (tweets.length) {
    // Make another request to ensure we get every single tweet
    const lastTweetId = tweets[tweets.length - 1].id;
    const nextPagesTweets = await getAllTweets(lastTweetId);
    if (nextPagesTweets.length) tweets = tweets.concat(nextPagesTweets);
  }

  return tweets;
}

/**
 * Get the latest 200 of {username}'s likes
 * @returns {Promise<Object[]>}
 */
async function getLikes() {
  return client.get("favorites/list", {
    count: maxCount,
    include_entities: false
  });
}

/**
 * Delete all tweets not safelisted and older than the max age
 * TODO: Create unit test for this
 */
async function deleteTweets() {
  log("Deleting tweets...");
  const tweets = await getAllTweets();
  const deletableTweets = tweets.filter(
    tweet =>
      !tweetsToSaveForever.includes(tweet.id) &&
      moment(tweet.created_at, tweetMomentDateFormat).isBefore(
        oldestAllowedDate
      )
  );

  const deletedTweets = await Promise.all(deletableTweets.map(deleteTweet));
  log(
    `Deleted ${deletedTweets.length} tweets out of ${
      tweets.length
    } total tweets`
  );
}

/**
 * Delete a tweet
 * @param {Object} tweet
 * @returns {Promise<String>}
 */
async function deleteTweet(tweet) {
  const id = tweet.id_str;

  try {
    const res = await client.post(`statuses/destroy`, { id, trim_user: true });
    log(`Deleted tweet (${id}) from ${res.created_at}: `, res.text);
    return id;
  } catch (error) {
    log.error(error, id);
  }
}

/**
 * Delete all likes older than the max age
 * TODO: Create unit test for this
 */
async function deleteLikes() {
  log("Deleting likes...");
  const tweets = await getLikes();
  const deletableTweets = tweets.filter(tweet =>
    moment(tweet.created_at, tweetMomentDateFormat).isBefore(oldestAllowedDate)
  );

  const deletedTweets = await Promise.all(deletableTweets.map(deleteLike));
  log(
    `Deleted ${deletableTweets.length} likes out of ${
      tweets.length
    } total likes`
  );
}

/**
 * Delete a tweet
 * @param {Object} tweet
 * @returns {Promise<String>}
 */
async function deleteLike(tweet) {
  const id = tweet.id_str;

  try {
    const res = await client.post(`favorites/destroy`, {
      id,
      include_entities: false
    });
    log(`Deleted like (${id}) from ${res.created_at}: `, res.text);
    return id;
  } catch (error) {
    log.error(error, id);
  }
}

/**
 * Disable retweets for everyone I follow
 */
async function disableRetweets() {
  const { ids } = await client.get("friends/ids", {
    stringify_ids: true,
    screen_name: username
  });

  let count = 0;

  try {
    await Promise.all(
      ids.map(async user_id => {
        log.info("Disabling retweets for", user_id);
        await client.post("friendships/update", { user_id, retweets: false });
        count++;
      })
    );

    log("Disabled retweets", { totalDisabled: count });
  } catch (error) {
    log.error("Error disabling retweets", { totalDisabled: count });
    throw error;
  }
}
