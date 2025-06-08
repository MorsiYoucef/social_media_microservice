import Search from "../models/Search"
import logger from "../utils/logger"

interface IEvent  {
    postId: string,
    userId: string,
    content: string,
    createAt: Date,
}


export const handlePostCreated = async (event: IEvent) => {
  try {
    const newSearchPost: InstanceType<typeof Search> = new Search({
      postId: event.postId,
      userId: event.userId,
      content: event.content,
      createdAt: event.createAt,
    });

    await newSearchPost.save();
    logger.info(
      ` Search post created: ${event.postId}, ${newSearchPost._id?.toString()}`
    );
  } catch (error) {
    logger.error("Error handling post creation event");
  }
};