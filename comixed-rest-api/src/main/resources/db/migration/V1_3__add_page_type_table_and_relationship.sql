-- create the table

CREATE TABLE page_types(
	id bigint generated by default as identity not null,
	name varchar(32) not null,
	primary key (id)
);

ALTER TABLE page_types add constraint page_types_name_unique unique (name);

-- add the relationship back to the pages table

ALTER TABLE pages add type_id bigint not null;
ALTER TABLE pages add constraint pages_page_types foreign key (type_id) references page_types;

-- insert the page types
INSERT INTO page_types (id, name) 
	VALUES (1, 'front-cover'),
	       (2, 'inner-cover'),
	       (3, 'back-cover'),
	       (10, 'roundup'),
	       (20, 'story'),
	       (30, 'advertisement'),
	       (40, 'editorial'),
	       (50, 'letters'),
	       (60, 'preview'),
	       (90, 'other'),
	       (99, 'filtered');