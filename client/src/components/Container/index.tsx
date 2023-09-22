// React
import React, { FC } from "react";

// Existing and custom components
import {
  Avatar,
  Flex,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  Spacer,
  Tag,
  Text,
} from "@chakra-ui/react";
import Icon from "@components/Icon";
import Navigation from "@components/Navigation";
import SearchBox from "@components/SearchBox";
import Error from "@components/Error";

// Existing and custom types
import { ContentProps, PageProps } from "@types";

// Routing and navigation
import { useNavigate } from "react-router-dom";

// Utility functions and libraries
import { getData } from "@database/functions";
import { useToken } from "src/authentication/useToken";
import _ from "lodash";
import dayjs from "dayjs";
import FileSaver from "file-saver";
import slugify from "slugify";
import Loading from "@components/Loading";

// Content container
const Content: FC<ContentProps> = ({ children, isError, isLoaded }) => {
  // Check values and set defaults if required
  if (_.isUndefined(isError)) isError = false;
  if (_.isUndefined(isLoaded)) isLoaded = true;

  return (
    <Flex
      direction={"column"}
      wrap={"wrap"}
      gap={"6"}
      w={"100%"}
      h={"100%"}
      maxH={{ base: "100%", lg: "92vh" }}
      overflowY={"auto"}
    >
      {/* Present an error screen */}
      {isError && <Error />}

      {/* Present a loading screen */}
      {!isLoaded && !isError && <Loading />}

      {/* Show children once done loading and no errors present */}
      {isLoaded && !isError && children}
    </Flex>
  );
};

// Page container
const Page: FC<PageProps> = ({ children }) => {
  const navigate = useNavigate();

  const [token, setToken] = useToken();

  const performBackup = () => {
    // Retrieve all data stored in the system
    getData(`/system/backup`).then((response) => {
      FileSaver.saveAs(
        new Blob([JSON.stringify(response, null, "  ")]),
        slugify(`backup_${dayjs(Date.now()).toJSON()}.json`)
      );
    });
  };

  const performLogout = () => {
    // Invalidate the token and refresh the page
    setToken({
      name: token.name,
      orcid: token.orcid,
      id_token: "",
    });
    navigate(0);
  };

  return (
    <Flex
      direction={{ base: "column", lg: "row" }}
      minH={"100vh"}
      w={"100%"}
      p={"0"}
      m={"0"}
    >
      {/* Navigation component */}
      <Flex
        p={"4"}
        justify={"center"}
        w={{ base: "100%", lg: "15%" }}
        borderBottom={{ base: "1px", lg: "none" }}
        borderColor={{ base: "gray.100", lg: "gray.100" }}
      >
        <Navigation />
      </Flex>

      <Flex
        direction={"column"}
        w={{ base: "100%", lg: "85%" }}
        borderLeft={{ base: "none", lg: "1px" }}
        borderColor={{ base: "gray.100", lg: "gray.100" }}
      >
        {/* Search box component */}
        <Flex
          w={"100%"}
          h={"8vh"}
          align={"center"}
          display={{ base: "none", lg: "flex" }}
          background={"white"}
          borderBottom={"1px"}
          borderColor={"gray.100"}
        >
          <Spacer />

          <SearchBox />

          <Spacer />

          <Flex gap={"4"} align={"center"} h={"100%"}>
            <Menu>
              <MenuButton h={"100%"} _hover={{ bg: "gray.200" }}>
                <Flex
                  direction={"row"}
                  align={"center"}
                  gap={"2"}
                  p={"1"}
                  ml={"2"}
                  mr={"2"}
                >
                  <Avatar name={token.name} size={"sm"} />
                  <Text size={"xs"} fontWeight={"semibold"}>
                    {token.name}
                  </Text>
                  <Icon name={"c_down"} />
                </Flex>
              </MenuButton>

              {/* List of drop-down menu items */}
              <MenuList ml={"2"} mr={"2"}>
                <MenuGroup>
                  <Flex p={"4"} pt={"2"} pb={"2"} gap={"4"} direction={"column"}>
                    <Text fontWeight={"semibold"}>Hello {token.name.split(" ")[0]}!</Text>
                    <Tag colorScheme={"green"}>{token.orcid}</Tag>
                  </Flex>
                </MenuGroup>
                <MenuDivider />

                <MenuGroup title={"System"}>
                  <MenuItem onClick={() => performBackup()}>
                    <Flex direction={"row"} align={"center"} gap={"4"} ml={"2"}>
                      <Icon name={"download"} />
                      Backup
                    </Flex>
                  </MenuItem>
                  <MenuItem onClick={() => navigate(`/settings`)}>
                    <Flex direction={"row"} align={"center"} gap={"4"} ml={"2"}>
                      <Icon name={"settings"} />
                      Settings
                    </Flex>
                  </MenuItem>
                </MenuGroup>
                <MenuDivider />

                <MenuGroup title={"Account"}>
                  <MenuItem onClick={() => performLogout()}>
                    <Flex direction={"row"} align={"center"} gap={"4"} ml={"2"}>
                      <Icon name={"exit"} />
                      Logout
                    </Flex>
                  </MenuItem>
                </MenuGroup>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>

        {/* Main content components */}
        {children}
      </Flex>
    </Flex>
  );
};

export { Content, Page };
