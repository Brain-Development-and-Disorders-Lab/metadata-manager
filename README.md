# Metadata Manager

An open-source and fully-customizable workflow tool for tracking and managing metadata generated from scientific experiments.

## Concepts

### Entities

Everything is recognized as an "entity", from physical slices to antibodies. Entities are generalized and expressed using Attributes, expressing data via Parameters.

Entities have the following metadata configured:

- *Name*: This is an ID or general name for an Entity.
- *Owner*: The owner or creator of the Entity.
- *Date*: The date that the Entity came into existence.
- *Description*: An entirely textual description of the Entity. Metadata should be expressed later as Attributes.
- *Origin*: If the Entity was created as a product of another Entity, then the other Entity is the Origin. The Origin Entity should already exist in the system.
- *Products*: If the Entity being entered into the system generated subsequent Entities that already exist in the system, the generated Entities can be specified.
- *Collections*: Specify any existing Collections that the Entity belongs to.

### Attributes

Attributes are the primary method of expressing metadata associated with Entities. Attributes contain points of metadata known as Parameters. Parameters can be of the following types:

- `string`: A textual description of any length.
- `number`: A numerical value.
- `date`: A date or time.
- `url`: A link to external or internal item.
- `entity`: A "soft" relation to another Entity. This does not have the significance of an Origin or Product Entity in the overall system, but could be used to express a similar concept.

### Collections

Collections are simply groups of Entities. Collections can be of one type of Entities, or a mixture of multiple types.

## Deployment

The application has been entirely containerized using Docker containers. To start a fresh instance of the application, use `docker-compose`:

```Bash
$ docker-compose up
```

This command will build all required containers before starting the containers required to run the system. The system can then be viewed in the browser at `localhost:8080`, and the MongoDB database can be browsed using the `mongo-express` interface accessible at `localhost:8081`.
