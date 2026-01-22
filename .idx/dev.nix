{ pkgs, ... }: {
  # Canal de pacotes estável
  channel = "stable-23.11";

  # Pacotes necessários
  packages = [
    pkgs.nodejs_20       # Versão compatível com o canal estável
    pkgs.nodePackages.npm
  ];

  # Variáveis de ambiente
  env = {};

  idx = {
    # Extensões para produtividade
    extensions = [
      "bradlc.vscode-tailwindcss"
      "dsznajder.es7-react-js-snippets"
      "esbenp.prettier-vscode"
    ];

    # Configuração do Workspace
    workspace = {
      # Executa na primeira vez que o projeto é criado
      onCreate = {
        npm-install = "npm install --force";
      };
    };

    # Preview do Next.js
    previews = {
      enable = true;
      previews = {
        web = {
          # Comando otimizado para o Next.js no IDX
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--host" "0.0.0.0"];
          manager = "web";
        };
      };
    };
  };
}