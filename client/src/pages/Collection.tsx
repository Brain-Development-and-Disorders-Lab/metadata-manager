// React and Grommet
import React, { useEffect, useState } from "react";
import {
  Anchor,
  Box,
  Button,
  FormField,
  Heading,
  Layer,
  List,
  PageHeader,
  Paragraph,
  Select,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tag,
} from "grommet/components";
import { Page, PageContent } from "grommet";
import { Add, Close, LinkNext } from "grommet-icons";

// Navigation
import { useParams, useNavigate } from "react-router-dom";

// Database and models
import { getData, postData } from "src/database/functions";
import { CollectionModel, EntityModel } from "types";

// Custom components
import ErrorLayer from "src/components/ErrorLayer";
import Linky from "src/components/Linky";

export const Collection = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("An error has occurred.");

  const [showAdd, setShowAdd] = useState(false);

  const [collectionData, setCollectionData] = useState({} as CollectionModel);
  const [entityOptions, setEntityOptions] = useState(
    [] as { name: string; id: string }[]
  );
  const [entitiesSelected, setEntitiesSelected] = useState(
    [] as { name: string; id: string }[]
  );

  useEffect(() => {
    // Populate Collection data
    const response = getData(`/collections/${id}`);

    // Handle the response from the database
    response.then((value) => {
      setCollectionData(value);

      // Check the contents of the response
      if (value["error"] !== undefined) {
        setErrorMessage(value["error"]);
        setIsError(true);
      }

      setIsLoaded(true);
    }).then(() => {
      // Populate Entity data
      const entities = getData(`/entities`);

      // Handle the response from the database
      entities.then((entity) => {
        setEntityOptions(entity.map((e: EntityModel) => {
          return { name: e.name, id: e._id };
        }));

        // Check the contents of the response
        if (entity["error"] !== undefined) {
          setErrorMessage(entity["error"]);
          setIsError(true);
        }

        setIsLoaded(true);
      });
    });

    return;
  }, [id, isLoaded]);

  /**
   * Callback function to add Entities to a Collection
   * @param {{ entities: string[], collection: string }} data List of Entities and a Collection to add the Entities to
   */
  const onAdd = (data: { entities: string[], collection: string }): void => {
    postData(`/collections/add`, data).then(() => {
      navigate(`/collections/${id}`);
    });
  };

  /**
   * Callback function to remove the Entity from the Collection, and refresh the page
   * @param {{ entities: string, collection: string }} data ID of the Entity and Collection to remove the Entity from
   */
  const onRemove = (data: { entity: string, collection: string }): void => {
    postData(`/collections/remove`, data).then(() => {
      navigate(`/collections/${id}`);
    });
  };

  return (
    <Page kind="wide" pad={{left: "small", right: "small"}}>
      <PageContent>
        {isLoaded && isError === false ? (
          <Box gap="small" margin="small">
            <Box direction="row" justify="between">
              <PageHeader
                title={collectionData.name}
                parent={
                  <Anchor label="View all Collections" href="/collections" />
                }
              />
            </Box>

            <Box direction="column" gap="small">
              {/* Metadata table */}
              <Heading level="3" margin="none">
                Metadata
              </Heading>

              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell scope="row" border>
                      <Heading level="4" margin="xsmall">
                        Description
                      </Heading>
                    </TableCell>
                    <TableCell border>
                      <Paragraph>{collectionData.description}</Paragraph>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              {/* List of Entities in the Collection */}
              <Box direction="row" justify="between" margin="small">
                <Heading level="3" margin="none" alignSelf="center">Entities</Heading>
                <Button
                  label="Add"
                  icon={<Add />}
                  onClick={() => {
                    setShowAdd(!showAdd);
                  }}
                  primary
                  reverse
                />
              </Box>

              {collectionData.entities.length > 0 && (
                <List
                  itemKey={(entity) => `entity-${entity}`}
                  primaryKey={(entity) => {
                    return <Linky type="entities" id={entity} key={`linky-${entity}`}/>
                  }}
                  secondaryKey={(entity) => {
                    return (
                      <Box direction="row" gap="small" margin="none" key={`box-${entity}`}>
                        <Button
                          key={`view-${entity}`}
                          icon={<LinkNext />}
                          color="accent-4"
                          primary
                          label="View"
                          onClick={() => {navigate(`/entities/${entity}`)}}
                          reverse
                        />
                        <Button
                          key={`remove-${entity}`}
                          icon={<Close />}
                          primary
                          label="Remove"
                          color="status-critical"
                          onClick={() => {
                            if (id) {
                              // Remove the entity from the collection
                              onRemove({
                                entity: entity,
                                collection: id,
                              });

                              // Force the page to reload by setting the isLoaded state
                              setIsLoaded(false);
                            }
                          }}
                          reverse
                        />
                      </Box>
                    )
                  }}
                  data={collectionData.entities}
                  show={4}
                  paginate
                />
              )}
            </Box>

            {showAdd && (
              <Layer
                onEsc={() => setShowAdd(false)}
                onClickOutside={() => setShowAdd(false)}
              >
                {/* Heading and close button */}
                <Box direction="row" width="large" justify="between" margin={{ right: "small" }} pad="medium">
                  <Heading level="2" margin="small">
                    Add Entities
                  </Heading>
                  <Button
                    icon={<Close />}
                    onClick={() => setShowAdd(false)}
                    plain
                  />
                </Box>

                {/* Select component for Entities */}
                <Box direction="column" pad="medium">
                  <FormField
                    name="add"
                    info="Add existing Entities to the Collection."
                  >
                    <Select
                      options={entityOptions}
                      labelKey="name"
                      value={entitiesSelected}
                      valueKey="name"
                      onChange={({ value }) => {
                        if (!entitiesSelected.includes(value)) {
                          setEntitiesSelected([...entitiesSelected, value]);
                        }
                      }}
                      searchPlaceholder="Search..."
                      onSearch={(query) => {
                        const escapedText = query.replace(
                          /[-\\^$*+?.()|[\]{}]/g,
                          "\\$&"
                        );
                        const filteredText = new RegExp(escapedText, "i");
                        setEntityOptions(
                          entityOptions
                            .filter((entity) => filteredText.test(entity.name))
                            .map((entity) => {
                              return { name: entity.name, id: entity.id };
                            })
                        );
                      }}
                    />
                  </FormField>
                  <Box direction="column" gap="xsmall">
                    {entitiesSelected.map((entity) => {
                      return (
                        <Tag
                          name="Entity"
                          value={entity.name}
                          key={entity.name}
                          onRemove={() => {
                            setEntitiesSelected(
                              entitiesSelected.filter((item) => {
                                return item !== entity;
                              })
                            );
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>

                {/* "Done" button */}
                <Box direction="row" pad="medium" justify="center">
                  <Button
                    label="Done"
                    color="status-ok"
                    primary
                    onClick={() => {
                      if (id) {
                        // Add the Entities to the Collection
                        onAdd({
                          entities: entitiesSelected.map((entity) => entity.id),
                          collection: id,
                        });

                        setEntitiesSelected([]);
                        setShowAdd(false);

                        // Force the page to reload by setting the isLoaded state
                        setIsLoaded(false);
                      }
                    }}
                  />
                </Box>
              </Layer>
            )}
          </Box>
        ) : (
          <Box fill align="center" justify="center">
            <Spinner size="large" />
          </Box>
        )}

        {isError && <ErrorLayer message={errorMessage} />}
      </PageContent>
    </Page>
  );
};

export default Collection;
