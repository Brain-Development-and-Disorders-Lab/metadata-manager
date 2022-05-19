import {
  Anchor,
  Box,
  Button,
  Heading,
  Layer,
  Paragraph,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Text,
} from "grommet";
import { Close } from "grommet-icons";

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getData } from "src/lib/database/getData";
import Flow from "src/view/components/Flow";
import { SampleModel } from "types";
import ErrorLayer from "../../components/ErrorLayer";
import Linky from "../../components/Linky";
import ParameterCard from "../../components/ParameterCard";

export const Sample = () => {
  const { id } = useParams();

  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("An error has occurred.");

  const [sampleData, setSampleData] = useState({} as SampleModel);

  const [showFlow, setShowFlow] = useState(false);

  useEffect(() => {
    const response = getData(`/samples/${id}`);

    // Handle the response from the database
    response.then((value) => {
      setSampleData(value);

      // Check the contents of the response
      if (value["error"] !== undefined) {
        setErrorMessage(value["error"]);
        setIsError(true);
      }

      setIsLoaded(true);
    });
    return;
  }, [id]);


  return (
    <>
      {isLoaded && isError === false ?
        <Box gap="small" margin="small">
          <Box direction="row" justify="between">
            <Heading level="2" margin="small">
              Sample "{sampleData.name}"
            </Heading>
            <Button label={"Flow"} primary onClick={() => setShowFlow(true)} />
          </Box>

          <Table>
            <TableBody>
              <TableRow>
                <TableCell scope="row" align="right" border>
                  <Heading level="4" margin="xsmall">
                    Created
                  </Heading>
                </TableCell>
                <TableCell border>
                  <Text>{new Date(sampleData.created).toDateString()}</Text>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell scope="row" align="right" border>
                  <Heading level="4" margin="xsmall">
                    Owner
                  </Heading>
                </TableCell>
                <TableCell border>
                  <Text>
                    <Anchor label={sampleData.owner} color="dark-2" />
                  </Text>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell scope="row" align="right" border>
                  <Heading level="4" margin="xsmall">
                    Description
                  </Heading>
                </TableCell>
                <TableCell border>
                  <Paragraph>{sampleData.description}</Paragraph>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell scope="row" border align="right">
                  <Heading level="4" margin="xsmall">
                    Origin
                  </Heading>
                </TableCell>
                <TableCell border>
                  {sampleData.associations.origin.id !== "" ?
                    <Linky
                      key={sampleData.associations.origin.id}
                      type="samples"
                      id={sampleData.associations.origin.id}
                    />
                  :
                    <Text>No origin specified.</Text>
                  }
                  
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell scope="row" align="right" border>
                  <Heading level="4" margin="xsmall">
                    Primary project
                  </Heading>
                </TableCell>
                <TableCell border>
                  <Linky
                    key={sampleData.project.id}
                    type="projects"
                    id={sampleData.project.id}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Box direction="row" align="center" background="light-2" round>
            <Heading level="4" margin="small">
              Associated projects
            </Heading>
            <Box
              wrap
              round
              direction="row"
              justify="center"
              align="center"
              margin="small"
              pad="small"
              gap="small"
            >
              {sampleData.projects.length > 0 ?
                sampleData.projects.map((project) => {
                  return (
                    <Linky
                      key={project.id}
                      type="projects"
                      id={project.id}
                    />
                  );
                })
              :
                <Text>No associated projects specified.</Text>
              }
            </Box>
          </Box>

          <Box direction="row" align="center" background="light-2" round>
            <Heading level="4" margin="small">
              Products
            </Heading>
            <Box
              wrap
              direction="row"
              justify="center"
              align="center"
              margin="small"
              pad="small"
              gap="small"
            >
              {sampleData.associations.products.map((product) => {
                return (
                  <Linky
                    key={product.id}
                    type="samples"
                    id={product.id}
                  />
                );
              })}
            </Box>
          </Box>

          <Box direction="row" align="center" background="light-2" round>
            <Heading level="4" margin="small">
              Parameters
            </Heading>
            <Box
              wrap
              round
              direction="row"
              justify="center"
              align="center"
              margin="small"
              pad="small"
              gap="small"
              background="light-2"
            >
              {sampleData.parameters.length > 0 ?
                sampleData.parameters.map((parameter) => {
                  return (
                    <ParameterCard data={parameter} />
                  );
                })
              :
                <Text>No parameters specified.</Text>
              }
            </Box>
          </Box>
        </Box>
      :
        <Box fill align="center" justify="center">
          <Spinner size="large" />
        </Box>
      }
      {isError && <ErrorLayer message={errorMessage} />}
      {showFlow &&
        <Layer
          full
          onEsc={() => setShowFlow(false)}
          onClickOutside={() => setShowFlow(false)}
        >
          <Box direction="row" justify="between" margin={{ right: "small" }}>
            <Heading level="2" margin="small">
              Flow: {sampleData.name}
            </Heading>
            <Button
              icon={<Close />}
              onClick={() => setShowFlow(false)}
              plain
            />
          </Box>
          <Flow id={sampleData._id} />
        </Layer>
      }
    </>
  );
};

export default Sample;
