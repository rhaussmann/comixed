/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { SelectItem } from 'primeng/api';
import { ComicCollectionEntry } from 'app/library/models/comic-collection-entry';
import { LibraryAdaptor } from 'app/library';
import { Title } from '@angular/platform-browser';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';

@Component({
  selector: 'app-teams-page',
  templateUrl: './teams-page.component.html',
  styleUrls: ['./teams-page.component.scss']
})
export class TeamsPageComponent implements OnInit, OnDestroy {
  teamsSubscription: Subscription;
  teams: ComicCollectionEntry[];
  langChangeSubscription: Subscription;

  protected rowOptions: Array<SelectItem>;
  rows = 10;

  constructor(
    private titleService: Title,
    private translateService: TranslateService,
    private libraryAdaptor: LibraryAdaptor,
    private breadcrumbAdaptor: BreadcrumbAdaptor
  ) {}

  ngOnInit() {
    this.teamsSubscription = this.libraryAdaptor.team$.subscribe(teams => {
      this.teams = teams;
      this.titleService.setTitle(
        this.translateService.instant('teams-page.title', {
          count: this.teams.length
        })
      );
    });
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.loadTranslations();
    this.load_rows_options();
  }

  ngOnDestroy() {
    this.teamsSubscription.unsubscribe();
    this.langChangeSubscription.unsubscribe();
  }

  private load_rows_options(): void {
    this.rowOptions = [
      {
        label: this.translateService.instant(
          'library-contents.options.rows.10-per-page'
        ),
        value: 10
      },
      {
        label: this.translateService.instant(
          'library-contents.options.rows.25-per-page'
        ),
        value: 25
      },
      {
        label: this.translateService.instant(
          'library-contents.options.rows.50-per-page'
        ),
        value: 50
      },
      {
        label: this.translateService.instant(
          'library-contents.options.rows.100-per-page'
        ),
        value: 100
      }
    ];
  }

  private loadTranslations() {
    this.breadcrumbAdaptor.loadEntries([
      {
        label: this.translateService.instant(
          'breadcrumb.entry.collections.root'
        )
      },
      {
        label: this.translateService.instant(
          'breadcrumb.entry.collections.teams-page'
        ),
        routerLink: ['/teams']
      }
    ]);
  }
}
