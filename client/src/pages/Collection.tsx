// React
import React, { useEffect, useState } from "react";

// Existing and custom components
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Link,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Select,
  Table,
  TableContainer,
  Tag,
  TagCloseButton,
  TagLabel,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Content } from "@components/Container";
import Error from "@components/Error";
import Icon from "@components/Icon";
import Linky from "@components/Linky";
import Loading from "@components/Loading";

// Existing and custom types
import { CollectionModel, EntityModel } from "@types";

// Routing and navigation
import { useParams, useNavigate } from "react-router-dom";

// Utility functions and libraries
import { deleteData, getData, postData } from "@database/functions";
import _ from "lodash";

const Collection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Page state
  const [editing, setEditing] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [collectionData, setCollectionData] = useState({} as CollectionModel);
  const [collectionEntities, setCollectionEntities] = useState([] as string[]);
  const [collectionDescription, setCollectionDescription] = useState("");
  const [allEntities, setAllEntities] = useState(
    [] as { name: string; id: string }[]
  );
  const [selectedEntities, setSelectedEntities] = useState([] as string[]);

  useEffect(() => {
    // Populate Collection data
    getData(`/collections/${id}`)
      .then((response) => {
        setCollectionData(response);
        setCollectionEntities(response.entities);
        setCollectionDescription(response.description);
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Could not retrieve Collection data.",
          status: "error",
          duration: 4000,
          position: "bottom-right",
          isClosable: true,
        });
        setIsError(true);
      })
      .finally(() => {
        setIsLoaded(true);
      });

    // Populate Entity data
    getData(`/entities`)
      .then((response) => {
        setAllEntities(
          response.map((e: EntityModel) => {
            return { name: e.name, id: e._id };
          })
        );
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Could not retrieve Entity data.",
          status: "error",
          duration: 4000,
          position: "bottom-right",
          isClosable: true,
        });
        setIsError(true);
      })
      .finally(() => {
        setIsLoaded(true);
      });
  }, [id, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      // Update the state of editable data fields
      setCollectionEntities(collectionData.entities);
    }
  }, [isLoaded]);

  /**
   * Callback function to add Entities to a Collection
   * @param {string[]} entities List of Entities to add
   */
  const addEntities = (entities: string[]): void => {
    setCollectionEntities([
      ...collectionEntities,
      ...entities.filter((entity) => !_.isEqual("", entity)),
    ]);
    setSelectedEntities([]);
    onClose();
  };

  /**
   * Callback function to remove the Entity from the Collection, and refresh the page
   * @param {{ collection: string, entity: string }} data ID of the Collection and the ID of the Entity to remove
   */
  const removeEntity = (id: string): void => {
    setCollectionEntities(
      collectionEntities.filter((entity) => {
        entity !== id;
      })
    );
  };

  /**
   * Handle the edit button being clicked
   */
  const handleEditClick = () => {
    if (editing) {
      const updateData: CollectionModel = {
        _id: collectionData._id,
        name: collectionData.name,
        description: collectionDescription,
        owner: collectionData.owner,
        created: collectionData.created,
        entities: collectionEntities,
      };

      // Update data
      postData(`/collections/update`, updateData)
        .then((_response) => {
          toast({
            title: "Saved!",
            status: "success",
            duration: 2000,
            position: "bottom-right",
            isClosable: true,
          });
        })
        .catch(() => {
          toast({
            title: "Error",
            description: "An error occurred when saving updates.",
            status: "error",
            duration: 2000,
            position: "bottom-right",
            isClosable: true,
          });
        })
        .finally(() => {
          setEditing(false);
        });
    } else {
      setEditing(true);
    }
  };

  // Delete the Collection when confirmed
  const handleDeleteClick = () => {
    // Update data
    deleteData(`/collections/${id}`)
      .then((_response) => {
        toast({
          title: "Deleted!",
          status: "success",
          duration: 2000,
          position: "bottom-right",
          isClosable: true,
        });
      })
      .catch(() => {
        toast({
          title: "Error",
          description: `An error occurred when deleting Collection "${collectionData.name}".`,
          status: "error",
          duration: 2000,
          position: "bottom-right",
          isClosable: true,
        });
      })
      .finally(() => {
        setEditing(false);
        navigate("/collections");
      });
  };

  return (
    <Content vertical={isError || !isLoaded}>
      {isLoaded ? (
        isError ? (
          <Error />
        ) : (
          <Flex direction={"column"}>
            <Flex
              p={"2"}
              direction={"row"}
              justify={"space-between"}
              align={"center"}
              wrap={"wrap"}
              gap={"4"}
            >
              <Flex
                align={"center"}
                gap={"4"}
                shadow={"lg"}
                p={"2"}
                border={"2px"}
                rounded={"md"}
                bg={"white"}
              >
                <Icon name={"collection"} size={"lg"} />
                <Heading fontWeight={"semibold"}>{collectionData.name}</Heading>
              </Flex>

              {/* Buttons */}
              <Flex
                direction={"row"}
                gap={"4"}
                wrap={"wrap"}
                bg={"white"}
                p={"4"}
                rounded={"md"}
              >
                {editing && (
                  <Popover>
                    <PopoverTrigger>
                      <Button
                        colorScheme={"red"}
                        rightIcon={<Icon name={"delete"} />}
                      >
                        Delete
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <PopoverArrow />
                      <PopoverCloseButton />
                      <PopoverHeader>Confirmation</PopoverHeader>
                      <PopoverBody>
                        Are you sure you want to delete this Collection?
                        <Flex direction={"row"} p={"2"} justify={"center"}>
                          <Button
                            colorScheme={"green"}
                            rightIcon={<Icon name={"check"} />}
                            onClick={handleDeleteClick}
                          >
                            Confirm
                          </Button>
                        </Flex>
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                )}
                <Button
                  colorScheme={editing ? "green" : "gray"}
                  rightIcon={
                    editing ? <Icon name={"check"} /> : <Icon name={"edit"} />
                  }
                  onClick={handleEditClick}
                >
                  {editing ? "Done" : "Edit"}
                </Button>
              </Flex>
            </Flex>

            <Flex direction={"row"} gap={"4"} p={"2"} wrap={"wrap"}>
              <Flex
                direction={"column"}
                p={"4"}
                gap={"4"}
                grow={"1"}
                h={"fit-content"}
                bg={"white"}
                rounded={"md"}
              >
                {/* Details */}
                <Flex gap={"2"} grow={"1"} direction={"column"} minH={"32"}>
                  <Heading fontWeight={"semibold"} size={"lg"}>
                    Details
                  </Heading>
                  <TableContainer>
                    <Table variant={"simple"} colorScheme={"blackAlpha"}>
                      <Thead>
                        <Tr>
                          <Th>Field</Th>
                          <Th>Value</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        <Tr>
                          <Td>Owner</Td>
                          <Td>
                            {_.isEqual(collectionData.owner, "") ? (
                              <Tag
                                size={"md"}
                                key={`warn-${collectionData._id}`}
                                colorScheme={"orange"}
                              >
                                <TagLabel>Not specified</TagLabel>
                                <Icon name={"warning"} />
                              </Tag>
                            ) : (
                              <Text>
                                <Link>{collectionData.owner}</Link>
                              </Text>
                            )}
                          </Td>
                        </Tr>
                        <Tr>
                          <Td>Description</Td>
                          <Td>
                            {_.isEqual(collectionData.description, "") ? (
                              <Tag
                                size={"md"}
                                key={`warn-${collectionData._id}`}
                                colorScheme={"orange"}
                              >
                                <TagLabel>Not specified</TagLabel>
                                <Icon name={"warning"} />
                              </Tag>
                            ) : editing ? (
                              <Textarea
                                value={collectionDescription}
                                onChange={(event) => {
                                  setCollectionDescription(event.target.value);
                                }}
                              />
                            ) : (
                              <Text>{collectionDescription}</Text>
                            )}
                          </Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Flex>
              </Flex>

              <Flex
                direction={"column"}
                p={"4"}
                gap={"4"}
                grow={"2"}
                h={"fit-content"}
                bg={"white"}
                rounded={"md"}
              >
                <Flex direction={"row"} justify={"space-between"}>
                  {/* Entities in the Collection */}
                  <Heading fontWeight={"semibold"} size={"lg"}>
                    Entities
                  </Heading>
                  {editing && (
                    <Button
                      leftIcon={<Icon name={"add"} />}
                      onClick={onOpen}
                      colorScheme={"green"}
                    >
                      Add
                    </Button>
                  )}
                </Flex>
                <Flex gap={"2"} grow={"1"} direction={"column"} minH={"32"}>
                  {collectionEntities && collectionEntities.length > 0 ? (
                    <TableContainer>
                      <Table variant={"simple"} colorScheme={"blackAlpha"}>
                        <Thead>
                          <Tr>
                            <Th>Name</Th>
                            <Th></Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {collectionEntities.map((entity) => {
                            return (
                              <Tr key={entity}>
                                <Td>
                                  <Linky id={entity} type={"entities"} />
                                </Td>
                                <Td>
                                  <Flex justify={"right"} gap={"6"}>
                                    {!editing && (
                                      <Button
                                        key={`view-collection-${entity}`}
                                        colorScheme={"blackAlpha"}
                                        rightIcon={<Icon name={"c_right"} />}
                                        onClick={() =>
                                          navigate(`/entities/${entity}`)
                                        }
                                      >
                                        View
                                      </Button>
                                    )}

                                    {editing && (
                                      <Button
                                        key={`remove-${entity}`}
                                        rightIcon={<Icon name={"delete"} />}
                                        colorScheme={"red"}
                                        onClick={() => {
                                          if (id) {
                                            removeEntity(entity);
                                          }
                                        }}
                                      >
                                        Remove
                                      </Button>
                                    )}
                                  </Flex>
                                </Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Text>This Collection is empty.</Text>
                  )}
                </Flex>
              </Flex>
            </Flex>

            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent p={"4"}>
                {/* Heading and close button */}
                <ModalHeader>Add Entities</ModalHeader>
                <ModalCloseButton />

                {/* Select component for Entities */}
                <Flex direction={"column"} p={"2"} gap={"2"}>
                  <FormControl>
                    <FormLabel>Add Entities</FormLabel>
                    <Select
                      title="Select Entity"
                      placeholder={"Select Entity"}
                      onChange={(event) => {
                        const selectedEntity = event.target.value.toString();
                        if (selectedEntities.includes(selectedEntity)) {
                          toast({
                            title: "Warning",
                            description: "Entity has already been selected.",
                            status: "warning",
                            duration: 2000,
                            position: "bottom-right",
                            isClosable: true,
                          });
                        } else {
                          setSelectedEntities((selectedEntities) => [
                            ...selectedEntities,
                            selectedEntity,
                          ]);
                        }
                      }}
                    >
                      {isLoaded &&
                        allEntities.map((entity) => {
                          return (
                            <option key={entity.id} value={entity.id}>
                              {entity.name}
                            </option>
                          );
                        })}
                      ;
                    </Select>
                  </FormControl>

                  <Flex direction={"row"} p={"2"} gap={"2"}>
                    {selectedEntities.map((entity) => {
                      if (!_.isEqual(entity, "")) {
                        return (
                          <Tag key={`tag-${entity}`}>
                            <Linky id={entity} type={"entities"} />
                            <TagCloseButton
                              onClick={() => {
                                setSelectedEntities(
                                  selectedEntities.filter((selected) => {
                                    return !_.isEqual(entity, selected);
                                  })
                                );
                              }}
                            />
                          </Tag>
                        );
                      } else {
                        return null;
                      }
                    })}
                  </Flex>
                </Flex>

                {/* "Done" button */}
                <Flex direction={"row"} p={"md"} justify={"center"}>
                  <Button
                    colorScheme={"green"}
                    onClick={() => {
                      if (id) {
                        // Add the Entities to the Collection
                        addEntities(selectedEntities);
                      }
                    }}
                  >
                    Done
                  </Button>
                </Flex>
              </ModalContent>
            </Modal>
          </Flex>
        )
      ) : (
        <Loading />
      )}
    </Content>
  );
};

export default Collection;
