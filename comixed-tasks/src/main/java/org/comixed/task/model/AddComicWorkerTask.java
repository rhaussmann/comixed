/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixed.task.model;

import java.io.File;
import lombok.extern.log4j.Log4j2;
import org.comixed.adaptors.AdaptorException;
import org.comixed.adaptors.FilenameScraperAdaptor;
import org.comixed.handlers.ComicFileHandler;
import org.comixed.handlers.ComicFileHandlerException;
import org.comixed.model.library.Comic;
import org.comixed.model.tasks.Task;
import org.comixed.repositories.library.ComicRepository;
import org.comixed.repositories.tasks.TaskRepository;
import org.comixed.task.encoders.ProcessComicTaskEncoder;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@ConfigurationProperties(prefix = "comic-file.handlers")
@Log4j2
public class AddComicWorkerTask extends AbstractWorkerTask {
  @Autowired private ObjectFactory<Comic> comicFactory;
  @Autowired private ComicFileHandler comicFileHandler;
  @Autowired private ComicRepository comicRepository;
  @Autowired private FilenameScraperAdaptor filenameScraper;
  @Autowired private ObjectFactory<ProcessComicTaskEncoder> processComicTaskEncoderObjectFactory;
  @Autowired private TaskRepository taskRepository;

  private String filename;
  private boolean deleteBlockedPages = false;
  private boolean ignoreMetadata = false;

  @Override
  @Transactional
  public void startTask() throws WorkerTaskException {
    this.log.debug("Adding file to library: {}", this.filename);

    final File file = new File(this.filename);
    Comic result = this.comicRepository.findByFilename(file.getAbsolutePath());

    if (result != null) {
      this.log.debug("Comic already imported: " + file.getAbsolutePath());
      return;
    }

    try {
      result = this.comicFactory.getObject();
      this.log.debug("Setting comic filename");
      result.setFilename(file.getAbsolutePath());
      this.log.debug("Scraping details from filename");
      this.filenameScraper.execute(result);
      this.log.debug("Loading comic details");
      this.comicFileHandler.loadComicArchiveType(result);

      this.log.debug("Saving comic");
      result = this.comicRepository.save(result);

      this.log.debug("Encoding process comic task");
      final ProcessComicTaskEncoder taskEncoder =
          this.processComicTaskEncoderObjectFactory.getObject();
      taskEncoder.setComic(result);
      taskEncoder.setDeleteBlockedPages(this.deleteBlockedPages);
      taskEncoder.setIgnoreMetadata(this.ignoreMetadata);

      this.log.debug("Saving process comic task");
      final Task task = taskEncoder.encode();
      this.taskRepository.save(task);
    } catch (ComicFileHandlerException | AdaptorException error) {
      throw new WorkerTaskException("Failed to load comic", error);
    }
  }

  @Override
  protected String createDescription() {
    final StringBuilder result = new StringBuilder();

    result
        .append("Add comic to library:")
        .append(" filename=")
        .append(this.filename)
        .append(" delete blocked pages=")
        .append(this.deleteBlockedPages ? "Yes" : "No")
        .append(" ignore metadata=")
        .append(this.ignoreMetadata ? "Yes" : "No");

    return result.toString();
  }

  public String getFilename() {
    return this.filename;
  }

  public void setFilename(final String filename) {
    this.filename = filename;
  }

  public boolean getDeleteBlockedPages() {
    return this.deleteBlockedPages;
  }

  /**
   * Sets whether blocked pages are marked as deleted.
   *
   * @param deleteBlockedPages the flag
   */
  public void setDeleteBlockedPages(boolean deleteBlockedPages) {
    this.deleteBlockedPages = deleteBlockedPages;
  }

  public boolean getIgnoreMetadata() {
    return this.ignoreMetadata;
  }

  public void setIgnoreMetadata(boolean ignore) {
    this.ignoreMetadata = ignore;
  }
}
